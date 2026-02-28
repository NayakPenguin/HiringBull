import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'akashdalla406@gmail.com';
  const now = new Date();
  const membershipEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month

  console.log(`\nActivating ONE_MONTH membership for: ${email}`);
  console.log(`Start: ${now.toISOString()}`);
  console.log(`End:   ${membershipEnd.toISOString()}\n`);

  const result = await prisma.membershipApplication.upsert({
    where: { email },
    update: {
      membershipStart: now,
      membershipEnd: membershipEnd,
      status: 'ACTIVE',
      planType: 'ONE_MONTH',
    },
    create: {
      full_name: email.split('@')[0],
      email: email,
      social_profile: '',
      reason: 'Dev testing',
      membershipStart: now,
      membershipEnd: membershipEnd,
      status: 'ACTIVE',
      planType: 'ONE_MONTH',
    },
  });

  console.log('MembershipApplication:', {
    id: result.id,
    email: result.email,
    plan: result.planType,
    status: result.status,
    start: result.membershipStart,
    end: result.membershipEnd,
  });

  // Also update user record if exists
  const userUpdate = await prisma.user.updateMany({
    where: { email },
    data: {
      isPaid: true,
      planExpiry: membershipEnd,
      current_plan_start: now,
      current_plan_end: membershipEnd,
    },
  });

  console.log(`User records updated: ${userUpdate.count}`);
  console.log('\n✅ Done! Sign out and sign back in to pick up the new membership.\n');

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
