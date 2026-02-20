"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const password_hash = await bcryptjs_1.default.hash('password123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@folcklore.com' },
        update: {},
        create: {
            email: 'admin@folcklore.com',
            password_hash,
            rol: 'ADMIN',
        },
    });
    console.log('Seed complete: admin@folcklore.com / password123');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map