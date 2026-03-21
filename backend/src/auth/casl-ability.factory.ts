import { AbilityBuilder, PureAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';

/**
 * Defines what each role CAN and CANNOT do.
 *
 * Usage in a controller:
 *   const ability = this.abilityFactory.createForUser(req.user);
 *   if (ability.cannot('delete', 'Lead')) throw new ForbiddenException();
 */
export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Subject =
  | 'Lead'
  | 'Call'
  | 'Campaign'
  | 'Report'
  | 'User'
  | 'Setting'
  | 'all';
export type AppAbility = PureAbility<[Action, Subject]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: { role: string; id: string }): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility);

    switch (user.role) {
      case 'ADMIN':
        // Admin can do everything
        can('manage', 'all');
        break;

      case 'MANAGER':
        can('manage', 'Lead');
        can('manage', 'Call');
        can('manage', 'Campaign');
        can('read', 'Report');
        can('read', 'User');
        can('update', 'User');
        cannot('delete', 'User');
        cannot('manage', 'Setting');
        break;

      case 'AGENT':
        can('read', 'Lead');
        can('create', 'Lead');
        can('update', 'Lead');
        can('create', 'Call');
        can('read', 'Call');
        can('read', 'Campaign');
        cannot('delete', 'Lead');
        cannot('manage', 'Report');
        cannot('manage', 'User');
        cannot('manage', 'Setting');
        break;

      case 'SUPERVISOR':
        can('manage', 'Lead');
        can('manage', 'Call');
        can('read', 'Campaign');
        can('manage', 'Report');
        can('read', 'User');
        cannot('manage', 'Setting');
        cannot('delete', 'User');
        break;

      default:
        // No permissions for unknown roles
        cannot('manage', 'all');
    }

    return build();
  }
}
