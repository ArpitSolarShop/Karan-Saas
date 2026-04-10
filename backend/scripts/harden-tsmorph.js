const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');

const project = new Project({
  tsConfigFilePath: path.join(__dirname, 'tsconfig.json'),
});

const directoriesToHarden = [
  'src/telephony',
  'src/agent-management',
  'src/campaigns',
];

async function hardenServices() {
  console.log('--- Hardening Services ---');
  for (const dir of directoriesToHarden) {
    const serviceFiles = project.getSourceFiles(path.join(__dirname, dir, '**/*.service.ts'));
    for (const sourceFile of serviceFiles) {
      console.log(`Processing ${sourceFile.getBaseName()}`);
      let modified = false;

      const classes = sourceFile.getClasses();
      for (const cls of classes) {
        if (!cls.hasExportKeyword() || !cls.getDecorator('Injectable')) continue;

        const methods = cls.getMethods();
        for (const method of methods) {
          const name = method.getName();
          if (name === 'constructor' || method.getScope() === 'private' || method.getScope() === 'protected') continue;

          const params = method.getParameters();
          const hasTenantId = params.some(p => p.getName() === 'tenantId');

          if (!hasTenantId) {
            method.insertParameter(0, { name: 'tenantId', type: 'string' });
            modified = true;
            console.log(`  Added tenantId to ${name}`);
          } else {
            // Ensure tenantId is the first argument for consistency (optional, might break existing calls, skipping for now if it already has it)
            // But if it already has it, it might be the 1st or 2nd. 
            // We'll leave it if it exists.
          }

          // Let's do basic AST replacements inside the method body for findUnique -> findFirst
          const text = method.getBodyText();
          if (text) {
            let newText = text;
            
            // This regex approach is simple but effective for standard Prisma calls inside the method body
            newText = newText.replace(/\.findUnique\(\s*\{\s*where:\s*\{\s*id\s*\}\s*\}\)/g, '.findFirst({ where: { id, tenantId } })');
            newText = newText.replace(/\.findUnique\(\s*\{\s*where:\s*\{\s*id\s*\},/g, '.findFirst({ where: { id, tenantId },');
            
            newText = newText.replace(/\.update\(\s*\{\s*where:\s*\{\s*id\s*\}\s*,/g, '.update({ where: { id, tenantId },');
            newText = newText.replace(/\.delete\(\s*\{\s*where:\s*\{\s*id\s*\}\s*\}/g, '.delete({ where: { id, tenantId } }');

            if (newText !== text) {
              method.setBodyText(newText);
              modified = true;
              console.log(`  Updated Prisma queries in ${name}`);
            }
          }
        }
      }

      if (modified) {
        sourceFile.saveSync();
      }
    }
  }
}

async function hardenControllers() {
  console.log('--- Hardening Controllers ---');
  for (const dir of directoriesToHarden) {
    const controllerFiles = project.getSourceFiles(path.join(__dirname, dir, '**/*.controller.ts'));
    for (const sourceFile of controllerFiles) {
      console.log(`Processing ${sourceFile.getBaseName()}`);
      let modified = false;

      // Add imports
      const hasJwtImport = sourceFile.getImportDeclaration(imp => imp.getModuleSpecifierValue().includes('jwt-auth.guard'));
      if (!hasJwtImport) {
        sourceFile.addImportDeclaration({
          namedImports: ['JwtAuthGuard'],
          moduleSpecifier: '../../auth/jwt-auth.guard' // Approximation, will fix later if needed or rely on ts --noEmit to catch
        });
        modified = true;
      }

      const hasTenantImport = sourceFile.getImportDeclaration(imp => imp.getModuleSpecifierValue().includes('tenant.guard'));
      if (!hasTenantImport) {
        sourceFile.addImportDeclaration({
          namedImports: ['TenantGuard'],
          moduleSpecifier: '../../auth/tenant.guard'
        });
        modified = true;
      }
      
      const commonNamedImports = sourceFile.getImportDeclaration(imp => imp.getModuleSpecifierValue() === '@nestjs/common');
      if (commonNamedImports) {
        if (!commonNamedImports.getNamedImports().some(ni => ni.getName() === 'UseGuards')) {
          commonNamedImports.addNamedImport('UseGuards');
        }
        if (!commonNamedImports.getNamedImports().some(ni => ni.getName() === 'Req')) {
          commonNamedImports.addNamedImport('Req');
        }
        modified = true;
      } else {
         // Should exist, but if not, whatever
      }

      const classes = sourceFile.getClasses();
      for (const cls of classes) {
        if (!cls.hasExportKeyword() || !cls.getDecorator('Controller')) continue;

        // Ensure UseGuards is present
        let useGuardsDecorator = cls.getDecorator('UseGuards');
        if (!useGuardsDecorator) {
          useGuardsDecorator = cls.addDecorator({
            name: 'UseGuards',
            arguments: ['JwtAuthGuard', 'TenantGuard']
          });
          modified = true;
        } else {
           const args = useGuardsDecorator.getArguments().map(a => a.getText());
           if (!args.includes('JwtAuthGuard')) useGuardsDecorator.addArgument('JwtAuthGuard');
           if (!args.includes('TenantGuard')) useGuardsDecorator.addArgument('TenantGuard');
           modified = true;
        }

        const methods = cls.getMethods();
        for (const method of methods) {
          if (!method.getDecorator('Get') && !method.getDecorator('Post') && !method.getDecorator('Patch') && !method.getDecorator('Put') && !method.getDecorator('Delete')) continue;

          // Replace @Query('tenantId') with @Req() req: any
          const params = method.getParameters();
          const queryTenantParam = params.find(p => {
             const dec = p.getDecorator('Query');
             return dec && dec.getArguments().some(a => a.getText().includes('tenantId'));
          });

          if (queryTenantParam) {
            queryTenantParam.remove();
            modified = true;
          }

          const reqParam = params.find(p => p.getDecorator('Req'));
          if (!reqParam) {
            method.insertParameter(0, {
               decorators: [{ name: 'Req', arguments: [] }],
               name: 'req',
               type: 'any'
            });
            modified = true;
            console.log(`  Added @Req() req: any to ${method.getName()}`);
          }

          // Service call modification logic is VERY hard to generalize safely in AST without deep type checking.
          // For now, I will NOT auto-patch service calls inside controller body. I will do that via manual regex or review.
        }
      }

      if (modified) {
        sourceFile.saveSync();
      }
    }
  }
}

async function run() {
  await hardenServices();
  await hardenControllers();
}

run();
