"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20230405194622 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20230405194622 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "user" rename column "paswword" to "password";');
    }
    async down() {
        this.addSql('alter table "user" rename column "password" to "paswword";');
    }
}
exports.Migration20230405194622 = Migration20230405194622;
//# sourceMappingURL=Migration20230405194622.js.map