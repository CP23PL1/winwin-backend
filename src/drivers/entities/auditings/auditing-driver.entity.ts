import { AuditingAction, AuditingEntity, AuditingEntityDefaultColumns } from 'typeorm-auditing';
import { Driver } from '../driver.entity';

@AuditingEntity(Driver)
export class AuditingDriver extends Driver implements AuditingEntityDefaultColumns {
  readonly _seq: number;
  readonly _action: AuditingAction;
  readonly _modifiedAt: Date;
}
