const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');

const project = new Project();

// Modules to target (these are the ones I hardened previously)
const sourceDirs = [
  'src/telephony/controllers',
  'src/agent-management/controllers',
  'src/campaigns/controllers'
];

sourceDirs.forEach(dir => {
  project.addSourceFilesAtPaths(path.join(process.cwd(), dir, '*.ts'));
});

project.getSourceFiles().forEach(sourceFile => {
  console.log(`Processing ${sourceFile.getBaseName()}...`);

  const classes = sourceFile.getClasses();
  classes.forEach(cls => {
    const methods = cls.getMethods();
    methods.forEach(method => {
      // Find calls to this.service.method(...) or this.skills.method(...)
      const callExpressions = method.getDescendantsOfKind(SyntaxKind.CallExpression);
      
      callExpressions.forEach(call => {
        const expression = call.getExpression();
        const text = expression.getText();
        
        // Match this.service.[method] or this.xxxxService.[method]
        if (text.match(/^this\.(service|[a-zA-Z]+Service)\.[a-zA-Z]+$/)) {
          console.log(`  Found call: ${text}`);
          
          const args = call.getArguments();
          const firstArg = args[0];
          
          if (firstArg) {
            const argText = firstArg.getText();
            // If the first argument is already something related to req.user.tenantId, skip
            if (argText === 'req.user.tenantId' || argText === 'tenantId') {
              // Special case: if it's literally 'tenantId' but 'tenantId' is not defined in the scope, fix it
              const declarations = firstArg.getSymbol()?.getDeclarations();
              if (!declarations || declarations.length === 0) {
                 console.log(`    Fixing undefined 'tenantId' to 'req.user.tenantId'`);
                 call.removeArgument(0);
                 call.insertArgument(0, 'req.user.tenantId');
              }
            } else {
              // It's a real argument like 'id' or 'body', but the service now wants tenantId first
              console.log(`    Injecting 'req.user.tenantId' as first argument`);
              call.insertArgument(0, 'req.user.tenantId');
            }
          } else {
            // No arguments, but service likely wants tenantId
            console.log(`    Adding 'req.user.tenantId' as first argument`);
            call.insertArgument(0, 'req.user.tenantId');
          }
        }
      });
      
      // Also catch the orphaned 'tenantId' variable in findMany calls if any
      // (My previous script did return this.service.findAll(tenantId))
      method.getDescendantsOfKind(SyntaxKind.Identifier).forEach(id => {
        if (id.getText() === 'tenantId') {
          const declarations = id.getSymbol()?.getDeclarations();
          if (!declarations || declarations.length === 0) {
            // Check if it's inside a call that we might have missed or just a standalone ident
            // But let's be careful. If it's a call like findAll(tenantId), it's already handled above.
          }
        }
      });
    });
  });

  sourceFile.saveSync();
});

console.log('Patching complete.');
