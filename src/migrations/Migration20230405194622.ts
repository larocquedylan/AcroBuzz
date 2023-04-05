import { Migration } from '@mikro-orm/migrations';

export class Migration20230405194622 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" rename column "paswword" to "password";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" rename column "password" to "paswword";');
  }

}
