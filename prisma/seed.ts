import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/password'

const prisma = new PrismaClient()

async function main() {
  // Clean slate so re-seeding is idempotent.
  await prisma.linkView.deleteMany()
  await prisma.sharedLink.deleteMany()

  const links = [
    {
      slug: 'welcome',
      title: 'Welcome to ShareBoard',
      body: 'This is a public share link. Every time someone opens it, a view is counted anonymously — no login required. Open the admin dashboard to see the analytics update.',
    },
    {
      slug: 'q3-notes',
      title: 'Q3 Planning Notes',
      body: 'A sample shared document. Unique visitors are tracked with a first-party cookie; raw IP addresses are never stored, only a salted hash.',
    },
    {
      slug: 'secret-memo',
      title: 'Confidential Memo',
      body: 'This document sits behind a password gate, so no view is counted until it is unlocked.\n\n(Seeded demo password: "letmein")',
      password: 'letmein',
    },
  ]

  for (const l of links) {
    await prisma.sharedLink.create({
      data: {
        slug: l.slug,
        title: l.title,
        body: l.body,
        passwordHash: l.password ? hashPassword(l.password) : null,
      },
    })
  }

  // Seed some historical views on "welcome" so the dashboard isn't empty.
  const welcome = await prisma.sharedLink.findUnique({
    where: { slug: 'welcome' },
  })
  if (welcome) {
    const visitors = ['v-alice', 'v-bob', 'v-carol', 'v-dave', 'v-erin']
    let total = 0
    for (const vid of visitors) {
      const hits = 1 + Math.floor(Math.random() * 4)
      total += hits
      await prisma.linkView.create({
        data: {
          sharedLinkId: welcome.id,
          visitorId: vid,
          ipHash: 'seedhash-' + vid,
          hits,
        },
      })
    }
    await prisma.sharedLink.update({
      where: { id: welcome.id },
      data: { viewCount: total },
    })
  }

  // Seed sample responses on "q3-notes" so the AI summary has something to work with.
  const q3 = await prisma.sharedLink.findUnique({ where: { slug: 'q3-notes' } })
  if (q3) {
    const sampleResponses = [
      'Really clear write-up, the timeline finally makes sense to me.',
      'I think the Q3 goals are a bit too ambitious given the team size.',
      'Love the direction. Can we add more detail on the budget though?',
      'Agree with the person worried about scope — we said the same last quarter.',
      'The privacy approach (hashing IPs) is a nice touch, good call.',
      'Timeline looks tight but doable if we cut the nice-to-haves.',
      'Not sure about the ambitious goals either, but excited to try.',
    ]
    for (const body of sampleResponses) {
      await prisma.response.create({ data: { sharedLinkId: q3.id, body } })
    }
  }

  console.log('Seeded ShareBoard ✓')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
