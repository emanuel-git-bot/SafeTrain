import { prisma } from '../plugins/prisma.js';
export async function userRoutes(server) {
    server.get('/users/me', {
        preValidation: [server.authenticate]
    }, async (request, reply) => {
        const jwtUser = request.user;
        const user = await prisma.user.findUnique({
            where: { id: jwtUser.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                area: true,
                createdAt: true,
                companyStudent: {
                    include: {
                        company: true
                    }
                }
            }
        });
        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }
        return {
            ...user,
            company: user.companyStudent?.company?.name
        };
    });
}
