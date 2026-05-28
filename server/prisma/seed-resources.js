/**
 * Seed script for curated Online Resources.
 *
 * Run:  node prisma/seed-resources.js
 *
 * Every entry is a real, well-known, freely accessible learning resource.
 * Adding/updating is idempotent (upsert by URL).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RESOURCES = [
    // ─── DSA ────────────────────────────────────────────────────────────────
    {
        title: 'NeetCode 150',
        description:
            'Curated list of 150 essential coding interview problems with video solutions in multiple languages.',
        url: 'https://neetcode.io/practice',
        category: 'DSA',
        type: 'COURSE',
        author: 'Navdeep Singh',
        source: 'neetcode.io',
        tags: ['dsa', 'leetcode', 'patterns'],
        difficulty: 'intermediate',
        estimated_min: 6000,
    },
    {
        title: "Striver's SDE Sheet",
        description:
            "Top coding interview problems handpicked for SDE roles. Topic-wise, beginner to advanced.",
        url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/',
        category: 'DSA',
        type: 'ARTICLE',
        author: 'Raj Vikramaditya (Striver)',
        source: 'takeuforward.org',
        tags: ['dsa', 'sheet', 'leetcode'],
        difficulty: 'intermediate',
        estimated_min: 5400,
    },
    {
        title: "Striver's A2Z DSA Course",
        description:
            'Free A-to-Z DSA roadmap from absolute basics to advanced, with curated problems for every topic.',
        url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2',
        category: 'DSA',
        type: 'COURSE',
        author: 'Raj Vikramaditya (Striver)',
        source: 'takeuforward.org',
        tags: ['dsa', 'beginner-friendly'],
        difficulty: 'beginner',
        estimated_min: 9000,
    },
    {
        title: 'LeetCode',
        description:
            'The largest practice platform for coding interview problems with company-wise tagged questions.',
        url: 'https://leetcode.com/problemset/',
        category: 'DSA',
        type: 'TOOL',
        author: 'LeetCode',
        source: 'leetcode.com',
        tags: ['dsa', 'practice', 'company-tagged'],
        difficulty: 'intermediate',
    },
    {
        title: 'Codeforces',
        description:
            'Competitive programming platform with rated contests; sharpens problem-solving for top-tier interviews.',
        url: 'https://codeforces.com/',
        category: 'DSA',
        type: 'TOOL',
        author: 'Codeforces',
        source: 'codeforces.com',
        tags: ['cp', 'contests'],
        difficulty: 'advanced',
    },
    {
        title: 'CSES Problem Set',
        description:
            '300 carefully chosen problems covering all the standard competitive programming topics.',
        url: 'https://cses.fi/problemset/',
        category: 'DSA',
        type: 'TOOL',
        author: 'Antti Laaksonen',
        source: 'cses.fi',
        tags: ['cp', 'curated'],
        difficulty: 'intermediate',
    },

    // ─── SYSTEM DESIGN ──────────────────────────────────────────────────────
    {
        title: 'The System Design Primer',
        description:
            'Open-source learning resource for system design interviews; covers scalability, caching, queues, more.',
        url: 'https://github.com/donnemartin/system-design-primer',
        category: 'SYSTEM_DESIGN',
        type: 'REPO',
        author: 'Donne Martin',
        source: 'github.com',
        tags: ['system-design', 'scalability'],
        difficulty: 'intermediate',
        estimated_min: 3000,
    },
    {
        title: 'ByteByteGo',
        description:
            'Animated explanations of system design concepts and real-world architectures (Netflix, Uber, WhatsApp).',
        url: 'https://www.youtube.com/@ByteByteGo',
        category: 'SYSTEM_DESIGN',
        type: 'VIDEO',
        author: 'Alex Xu',
        source: 'youtube.com',
        tags: ['system-design', 'animations'],
        difficulty: 'intermediate',
    },
    {
        title: 'Hello Interview - System Design',
        description:
            'Free deep-dive system design walkthroughs from FAANG-level interviewers; real interview problem flow.',
        url: 'https://www.hellointerview.com/learn/system-design',
        category: 'SYSTEM_DESIGN',
        type: 'COURSE',
        author: 'Hello Interview',
        source: 'hellointerview.com',
        tags: ['system-design', 'faang'],
        difficulty: 'advanced',
    },
    {
        title: 'Gaurav Sen — System Design',
        description:
            'In-depth system design tutorials covering load balancers, databases, distributed systems, and real-world problems.',
        url: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX',
        category: 'SYSTEM_DESIGN',
        type: 'VIDEO',
        author: 'Gaurav Sen',
        source: 'youtube.com',
        tags: ['system-design'],
        difficulty: 'intermediate',
    },

    // ─── INTERVIEW PREP ─────────────────────────────────────────────────────
    {
        title: 'Tech Interview Handbook',
        description:
            'Comprehensive open-source guide covering coding, behavioral, system design, resume and negotiation.',
        url: 'https://www.techinterviewhandbook.org/',
        category: 'INTERVIEW_PREP',
        type: 'REPO',
        author: 'Yangshun Tay',
        source: 'github.com',
        tags: ['interview', 'comprehensive'],
        difficulty: 'beginner',
        estimated_min: 1200,
    },
    {
        title: 'Coding Interview University',
        description:
            'Multi-month study plan to land a software engineering job at top tech companies.',
        url: 'https://github.com/jwasham/coding-interview-university',
        category: 'INTERVIEW_PREP',
        type: 'REPO',
        author: 'John Washam',
        source: 'github.com',
        tags: ['roadmap', 'self-study'],
        difficulty: 'beginner',
    },
    {
        title: 'AlgoExpert Behavioral Interview Guide',
        description:
            'How to structure answers using STAR, with common behavioral questions for tech interviews.',
        url: 'https://www.algoexpert.io/behavioral-interview',
        category: 'BEHAVIORAL',
        type: 'ARTICLE',
        author: 'AlgoExpert',
        source: 'algoexpert.io',
        tags: ['behavioral', 'star'],
        difficulty: 'beginner',
    },

    // ─── BEHAVIORAL ─────────────────────────────────────────────────────────
    {
        title: 'How to answer behavioral interview questions (STAR)',
        description:
            'Step-by-step framework for answering behavioral questions using Situation, Task, Action, Result.',
        url: 'https://www.themuse.com/advice/star-interview-method',
        category: 'BEHAVIORAL',
        type: 'ARTICLE',
        author: 'The Muse',
        source: 'themuse.com',
        tags: ['behavioral', 'star'],
        difficulty: 'beginner',
    },
    {
        title: 'Amazon Leadership Principles',
        description:
            "Official Amazon Leadership Principles — most behavioral interviews at Amazon map back to these.",
        url: 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles',
        category: 'BEHAVIORAL',
        type: 'ARTICLE',
        author: 'Amazon',
        source: 'amazon.jobs',
        tags: ['amazon', 'leadership-principles'],
        difficulty: 'beginner',
    },

    // ─── RESUME ─────────────────────────────────────────────────────────────
    {
        title: 'Resume Tips by Gergely Orosz',
        description:
            'What a great engineering resume looks like — concrete tips from a Big Tech hiring manager.',
        url: 'https://blog.pragmaticengineer.com/preparing-a-good-cv/',
        category: 'RESUME',
        type: 'ARTICLE',
        author: 'Gergely Orosz',
        source: 'pragmaticengineer.com',
        tags: ['resume', 'cv'],
        difficulty: 'beginner',
    },
    {
        title: 'Tech Resume Inside Out (Free Chapter)',
        description:
            'Detailed guide on writing tech resumes that get callbacks at top companies.',
        url: 'https://thetechresume.com/',
        category: 'RESUME',
        type: 'BOOK',
        author: 'Gergely Orosz',
        source: 'thetechresume.com',
        tags: ['resume'],
        difficulty: 'intermediate',
    },

    // ─── NEGOTIATION ────────────────────────────────────────────────────────
    {
        title: 'Ten Rules for Negotiating a Job Offer',
        description:
            'Classic essay on salary and offer negotiation by Haseeb Qureshi — required reading.',
        url: 'https://haseebq.com/my-ten-rules-for-negotiating-a-job-offer/',
        category: 'NEGOTIATION',
        type: 'ARTICLE',
        author: 'Haseeb Qureshi',
        source: 'haseebq.com',
        tags: ['negotiation', 'offer'],
        difficulty: 'intermediate',
        estimated_min: 30,
    },
    {
        title: 'Salary Negotiation by Patrick McKenzie',
        description:
            "Foundational article on negotiating compensation; widely shared across the industry.",
        url: 'https://www.kalzumeus.com/2012/01/23/salary-negotiation/',
        category: 'NEGOTIATION',
        type: 'ARTICLE',
        author: 'Patrick McKenzie',
        source: 'kalzumeus.com',
        tags: ['negotiation', 'salary'],
        difficulty: 'intermediate',
        estimated_min: 45,
    },

    // ─── COMPANY RESEARCH ───────────────────────────────────────────────────
    {
        title: 'Levels.fyi',
        description:
            'Compensation data across companies and levels, contributed by verified employees.',
        url: 'https://www.levels.fyi/',
        category: 'COMPANY_RESEARCH',
        type: 'TOOL',
        author: 'Levels.fyi',
        source: 'levels.fyi',
        tags: ['compensation', 'companies'],
        difficulty: 'beginner',
    },
    {
        title: 'Blind',
        description:
            'Anonymous professional network where employees share honest insights about companies, interviews and pay.',
        url: 'https://www.teamblind.com/',
        category: 'COMPANY_RESEARCH',
        type: 'TOOL',
        author: 'Blind',
        source: 'teamblind.com',
        tags: ['anonymous', 'reviews'],
        difficulty: 'beginner',
    },

    // ─── CAREER GROWTH ──────────────────────────────────────────────────────
    {
        title: 'The Pragmatic Engineer',
        description:
            'Industry-leading newsletter on Big Tech engineering practices, careers and inside scoops.',
        url: 'https://blog.pragmaticengineer.com/',
        category: 'CAREER_GROWTH',
        type: 'NEWSLETTER',
        author: 'Gergely Orosz',
        source: 'pragmaticengineer.com',
        tags: ['career', 'newsletter'],
        difficulty: 'intermediate',
    },
    {
        title: "Lenny's Newsletter",
        description:
            "Top-rated newsletter on product, growth and career growth from a former Airbnb PM.",
        url: 'https://www.lennysnewsletter.com/',
        category: 'CAREER_GROWTH',
        type: 'NEWSLETTER',
        author: "Lenny Rachitsky",
        source: 'lennysnewsletter.com',
        tags: ['product', 'career'],
        difficulty: 'beginner',
    },
    {
        title: 'staff.design',
        description:
            'Interviews with staff-level engineers and designers on growing into senior IC roles.',
        url: 'https://staffeng.com/',
        category: 'CAREER_GROWTH',
        type: 'ARTICLE',
        author: 'Will Larson',
        source: 'staffeng.com',
        tags: ['career', 'staff-engineer'],
        difficulty: 'advanced',
    },

    // ─── TECH BLOGS ─────────────────────────────────────────────────────────
    {
        title: 'Netflix Tech Blog',
        description:
            'Engineering deep-dives from the Netflix team; a great source for system design inspiration.',
        url: 'https://netflixtechblog.com/',
        category: 'TECH_BLOGS',
        type: 'ARTICLE',
        author: 'Netflix Engineering',
        source: 'netflixtechblog.com',
        tags: ['engineering', 'distributed-systems'],
        difficulty: 'advanced',
    },
    {
        title: 'Uber Engineering Blog',
        description:
            "Case studies from Uber engineering on building large-scale distributed systems.",
        url: 'https://www.uber.com/blog/engineering/',
        category: 'TECH_BLOGS',
        type: 'ARTICLE',
        author: 'Uber Engineering',
        source: 'uber.com',
        tags: ['engineering', 'scale'],
        difficulty: 'advanced',
    },
    {
        title: 'Meta Engineering Blog',
        description:
            "Meta's engineering blog — case studies on infra, ML, mobile, and developer tools.",
        url: 'https://engineering.fb.com/',
        category: 'TECH_BLOGS',
        type: 'ARTICLE',
        author: 'Meta Engineering',
        source: 'engineering.fb.com',
        tags: ['engineering'],
        difficulty: 'advanced',
    },

    // ─── PODCASTS & VIDEOS ──────────────────────────────────────────────────
    {
        title: 'Software Engineering Daily',
        description:
            "Daily podcast covering software engineering topics, from startup CTOs to FAANG architects.",
        url: 'https://softwareengineeringdaily.com/',
        category: 'PODCASTS_VIDEOS',
        type: 'PODCAST',
        author: 'SE Daily',
        source: 'softwareengineeringdaily.com',
        tags: ['podcast', 'engineering'],
        difficulty: 'intermediate',
    },
    {
        title: 'Lex Fridman Podcast',
        description:
            "Long-form conversations on AI, science and engineering with world-class researchers and founders.",
        url: 'https://lexfridman.com/podcast/',
        category: 'PODCASTS_VIDEOS',
        type: 'PODCAST',
        author: 'Lex Fridman',
        source: 'lexfridman.com',
        tags: ['ai', 'long-form'],
        difficulty: 'beginner',
    },
    {
        title: 'MIT 6.006 — Introduction to Algorithms',
        description:
            "Free MIT OpenCourseWare lectures on algorithms; foundational material for any interview.",
        url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
        category: 'DSA',
        type: 'COURSE',
        author: 'MIT OCW',
        source: 'ocw.mit.edu',
        tags: ['algorithms', 'mit', 'free'],
        difficulty: 'intermediate',
        estimated_min: 1800,
    },
];

async function main() {
    console.log(`[seed-resources] Upserting ${RESOURCES.length} resources...`);

    let created = 0;
    let updated = 0;

    for (const item of RESOURCES) {
        const existing = await prisma.resource.findUnique({ where: { url: item.url } });
        await prisma.resource.upsert({
            where: { url: item.url },
            update: { ...item, is_active: true },
            create: { ...item },
        });
        if (existing) updated++;
        else created++;
    }

    console.log(`[seed-resources] Done. Created: ${created}, Updated: ${updated}`);
}

main()
    .catch((e) => {
        console.error('[seed-resources] Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
