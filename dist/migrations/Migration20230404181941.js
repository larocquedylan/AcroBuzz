"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20230404181941 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20230404181941 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "post" alter column "title" type text using ("title"::text);');
    }
    async down() {
        this.addSql('alter table "post" alter column "title" type varchar(255) using ("title"::varchar(255));');
    }
}
exports.Migration20230404181941 = Migration20230404181941;
//# sourceMappingURL=Migration20230404181941.js.map