import { PrismaClient, UserRole } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  })
  console.log({ admin })

  // Create office agent user
  const agentPassword = await hash("agent123", 10)
  const agent = await prisma.user.upsert({
    where: { email: "agent@example.com" },
    update: {},
    create: {
      email: "agent@example.com",
      name: "Office Agent",
      passwordHash: agentPassword,
      role: UserRole.OFFICE_AGENT,
    },
  })
  console.log({ agent })

  // Create hospital user
  const hospitalPassword = await hash("hospital123", 10)
  const hospital = await prisma.user.upsert({
    where: { email: "hospital@example.com" },
    update: {},
    create: {
      email: "hospital@example.com",
      name: "Hospital User",
      passwordHash: hospitalPassword,
      role: UserRole.HOSPITAL_USER,
    },
  })
  console.log({ hospital })

  // Create sample plans
  const basicPlan = await prisma.plan.upsert({
    where: { name: "Basic Plan" },
    update: {},
    create: {
      name: "Basic Plan",
      description: "Basic health coverage for individuals",
      price: 50.0,
      durationDays: 365,
    },
  })
  console.log({ basicPlan })

  const familyPlan = await prisma.plan.upsert({
    where: { name: "Family Plan" },
    update: {},
    create: {
      name: "Family Plan",
      description: "Comprehensive health coverage for families",
      price: 120.0,
      durationDays: 365,
    },
  })
  console.log({ familyPlan })

  const premiumPlan = await prisma.plan.upsert({
    where: { name: "Premium Plan" },
    update: {},
    create: {
      name: "Premium Plan",
      description: "Premium health coverage with additional benefits",
      price: 200.0,
      durationDays: 365,
    },
  })
  console.log({ premiumPlan })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
