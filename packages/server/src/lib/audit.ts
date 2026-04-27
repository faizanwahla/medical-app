import { prisma } from "./prisma";

export async function createAuditLog(
  userId: string | null,
  action: string,
  resource: string,
  resourceId?: string,
  details?: string,
  ipAddress?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
