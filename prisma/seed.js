const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create audit firm users
  const auditOwnerFinance = await prisma.user.create({
    data: {
      email: 'alice@aldridge.com',
      name: 'Alice Johnson',
      role: 'AUDIT_OWNER_FINANCE',
      organization: 'Aldridge Advisors',
      isClient: false
    }
  });

  const auditOwnerITGC = await prisma.user.create({
    data: {
      email: 'bob@aldridge.com',
      name: 'Bob Smith',
      role: 'AUDIT_OWNER_ITGC',
      organization: 'Aldridge Advisors',
      isClient: false
    }
  });

  const leadTester = await prisma.user.create({
    data: {
      email: 'charlie@aldridge.com',
      name: 'Charlie Brown',
      role: 'LEAD_TESTER',
      organization: 'Aldridge Advisors',
      isClient: false
    }
  });

  // Create client users
  const clientOwnerFinance = await prisma.user.create({
    data: {
      email: 'john@acme.com',
      name: 'John Sanders',
      role: 'CLIENT_OWNER_FINANCE',
      organization: 'Acme Corp',
      isClient: true
    }
  });

  const controlOwner = await prisma.user.create({
    data: {
      email: 'mike@acme.com',
      name: 'Mike Davis',
      role: 'CONTROL_OWNER',
      organization: 'Acme Corp',
      isClient: true
    }
  });

  // Create audit
  const audit = await prisma.audit.create({
    data: {
      clientName: 'Acme Corp',
      auditFirm: 'Aldridge Advisors',
      status: 'ACTIVE',
      progress: 35,
      relationshipOwnerId: clientOwnerFinance.id,
      auditOwnerId: auditOwnerFinance.id
    }
  });

  // Create controls
  const financeControl1 = await prisma.control.create({
    data: {
      controlId: 'FIN-1',
      title: 'Monthly bank reconciliation',
      description: 'Ensures all cash accounts are reconciled monthly with supporting documentation and reviews.',
      type: 'FINANCE',
      status: 'EVIDENCE_RECEIVED',
      progress: 40,
      dueDate: new Date('2025-08-10'),
      deadline: new Date('2025-08-30'),
      notes: 'Control execution appears timely, but evidence package lacks annotations explaining reconciling items.',
      auditId: audit.id,
      controlOwnerId: controlOwner.id,
      testerId: leadTester.id
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });