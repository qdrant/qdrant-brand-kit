// Copy from the current qdrant.tech (read 2026-11-21), verbatim, for the people, company and community sections:
// /about-us/, /stars/, /partners/, /community/ and /qdrant-for-startups/. Where a quote was longer than one
// sentence, only its first full sentence is used, never a paraphrase. People are only those the site names, with
// the roles it gives them; their photos stay placeholders (initials) until a page supplies them. Links the site
// doesn't have are left out.

import type { Link } from "./site"

export type Person = { name: string; role: string }
export type Profile = Person & { bio: string; distinguished?: boolean }
export type Partner = { name: string; text: string; link?: Link }
export type PartnerGroup = { title: string; text: string; partners: Partner[] }
// A way to join: a Lucide icon, or `mark`, a social mark in web/assets/social (github, discord, x).
export type Channel = { title: string; text: string; icon?: string; mark?: string; link?: Link }
export type CommunityQuote = { name: string; handle: string; quote: string }
export type Principle = { title: string; text: string; icon?: string }

// About: "Leadership".
export const leadership = {
  title: "Leadership",
  people: [
    { name: "André Zayarni", role: "CEO & Co-Founder" },
    { name: "Andrey Vasnetsov", role: "CTO & Co-Founder" },
    { name: "David Stockton", role: "VP of Engineering" },
    { name: "Bastian Hofmann", role: "Head of Product" },
    { name: "Dominik Alberts", role: "Finance" },
    { name: "Manuel Meyer", role: "COO" },
    { name: "Randy Petkoff", role: "Sales" },
    { name: "Neil Kanungo", role: "Head of Growth & DevRel" },
  ] as Person[],
}

// About: "Join our team", the careers link under the investors.
export const joinTeam = {
  title: "Join our team",
  description: "Take a look at our open roles.",
  action: { label: "Get Started", href: "https://qdrant.to/jobs" },
}

// Stars: "Meet our Stars", the first twelve of the site's 23, in its order. The first three carry the site's "Distinguished Ambassador" badge.
export const stars = {
  title: "Meet our Stars",
  badge: "Distinguished Ambassador",
  action: { label: "Read the Qdrant Stars Handbook", href: "https://qdrant.github.io/qdrant-stars-handbook/" },
  profiles: [
    { name: "M K Pavan Kumar", role: "Data Scientist and Lead GenAI", distinguished: true, bio: "Kameshwara Pavan Kumar Mantha is a seasoned technology expert with +14 years of extensive experience in full stack development, cloud solutions, and AI." },
    { name: "Robert Caulk", role: "Founder of Emergent Methods", distinguished: true, bio: "Robert is working with a team on AskNews.app to adaptively enrich, index, and report on over 1 million news articles per day" },
    { name: "Tarun Jain", role: "Founding Engineer at Kaivid Labs", distinguished: true, bio: "Google Developer Expert in AI and two-time Google Summer of Code contributor (Red Hen Lab and caMicroscope)." },
    { name: "Nicola Procopio", role: "Senior Data Scientist @ ACSoftware", bio: "Data scientist and contributor to FastEmbed, Haystack, and Cheshire Cat A.I., powered by Qdrant." },
    { name: "Miguel Otero Pedrido", role: "Founder @ The Neural Maze", bio: "Machine Learning Engineer with 7+ years of experience." },
    { name: "Benito Martin", role: "Independent Consultant", bio: "Process engineer, with a passion for ML and AI." },
    { name: "Eduardo Vasquez", role: "Data Scientist and MLOps Engineer", bio: "Exploring generative AI and LLMs, with a focus on RAG workflows and fine-tuning." },
    { name: "Niranjan Akella", role: "MLOps R&D @ Genesys", bio: "AI engineer with a passion for science and deep expertise in deploying LLMs, diffusion, and vision models at scale." },
    { name: "Parichay Das", role: "Global Solutions Lead @ LTIMindtree", bio: "Tech leader with 14+ years of experience in AI and GenAI, helping global clients drive innovation through strategy, architecture, and data." },
    { name: "Athos Georgiou", role: "R&D Technical AI Lead @ CGI", bio: "R&D Technical AI Lead with 10+ years across AI, finance, academia, and energy." },
    { name: "Saurabh Rai", role: "Lead Engineer @ Resume Matcher", bio: "Creator of Resume Matcher, an open-source tool trusted by 30K+ users worldwide to optimize resumes for ATS and real-world roles, powered by Qdrant." },
    { name: "Roan Weigert", role: "DevRel AI Engineer @ APARAVI", bio: "AI creator spotlighting San Francisco's tech scene through interviews with leading founders, investors, and experts." },
  ] as Profile[],
}

// Partners: "Partner Directory", grouped as on the site. Only the cloud providers have links there.
export const partnerDirectory = {
  title: "Partner Directory",
  description: "Our global network of cloud service providers, implementation partners, and local resellers.",
  action: { label: "Become a partner", href: "#become-a-partner" },
  groups: [
    {
      title: "Cloud Service Providers",
      text: "Run Qdrant on the cloud platform your team already uses.",
      partners: [
        { name: "AWS", text: "Run Qdrant Cloud on Amazon Web Services, and choose to subscribe through AWS Marketplace.", link: { label: "Get started for free", href: "https://aws.amazon.com/marketplace/pp/prodview-rtphb42tydtzg?sr=0-1&ref_=beagle&applicationId=AWS-Marketplace-Console" } },
        { name: "Google Cloud", text: "Run Qdrant Cloud on Google Cloud, and choose to subscribe through Google Cloud Marketplace.", link: { label: "Get started for free", href: "https://console.cloud.google.com/marketplace/product/qdrant-public/qdrant?project=qdrant-public" } },
        { name: "Microsoft Azure", text: "Run Qdrant Cloud on Microsoft Azure, and choose to subscribe through Azure Marketplace.", link: { label: "Get started for free", href: "https://azuremarketplace.microsoft.com/en-en/marketplace/apps/qdrantsolutionsgmbh1698769709989.qdrant-db" } },
      ],
    },
    {
      title: "Implementation Partners",
      text: "Experts who design, build, and ship vector search and AI applications with Qdrant.",
      partners: [
        { name: "Airnauts", text: "Airnauts is a digital product agency with offices in Warsaw, New York, and Paris that combines strategy, design, and technology." },
        { name: "Antz AI", text: "Antz AI is an agentic AI consulting and automation company based in Hyderabad, India." },
        { name: "Bloomteq", text: "Bloomteq is an enterprise software and product development company based in Sarajevo, Bosnia and Herzegovina." },
        { name: "dida", text: "dida is a Berlin-based AI company that develops tailor-made AI software for process automation." },
        { name: "LAB3", text: "LAB3 is an AI and cloud consulting company headquartered in Seongnam, South Korea, serving public sector and enterprise customers." },
        { name: "Pento", text: "Pento is an AI and machine learning consulting company serving clients across the Americas." },
      ],
    },
    {
      title: "Resell Partners",
      text: "Local partners who sell, license, and support Qdrant in your region.",
      partners: [
        { name: "Aman Group", text: "Aman Group is an international IT group with offices in Israel, Europe, the United States, and Australia." },
        { name: "boxxe", text: "boxxe is a UK tech solutions provider based in York, England, serving public and corporate sector organizations." },
        { name: "Genesis Data Culture", text: "Genesis Data Culture is an AI and data analytics company based in São José dos Campos, Brazil." },
        { name: "Hewlett Packard Enterprise", text: "Hewlett Packard Enterprise (HPE) is a global technology company that helps organizations use AI, cloud, and networking to turn data into results." },
        { name: "Tata Communications", text: "Tata Communications, part of the Tata Group, is a global digital ecosystem enabler serving enterprises in more than 190 countries and territories." },
        { name: "Tegara Corporation", text: "Tegara Corporation is a research and development platform company based in Hamamatsu, Japan, that has supported developers since 1991." },
        { name: "tkxel", text: "tkxel is a technology partner with offices in the United States, Saudi Arabia, Portugal, and Pakistan." },
      ],
    },
  ] as PartnerGroup[],
}

// About: "Our story", its three passages (each beside a team photo on the site), the closing line, and the
// vision and mission.
export const ourStory = {
  title: "Our story",
  description:
    "In 2021, André Zayarni and Andrey Vasnetsov collaborated on a project aimed at leveraging vector similarity search to build a matching engine for unstructured data objects.",
  chapters: [
    {
      text: [
        "After exploring available options, including libraries like FAISS, it became clear that none of them met the requirements of features and scalability.",
      ],
      media: "Qdrant Team",
    },
    {
      text: [
        "As a result, Andrey decided to develop his own vision for a production-ready vector search engine from scratch.",
        "The first version was published on GitHub, quickly attracting significant interest from developers. The overwhelming feedback and questions from developers and startups confirmed that there was a shared need for such a tool.",
      ],
      media: "Team",
    },
    {
      text: [
        "As the project gained traction, the decision was made to formally establish Qdrant and continue developing the vector search engine into its current form.",
        "Today, Qdrant is the backbone of the most ambitious AI applications, powering everything from groundbreaking startups to enterprise-scale deployments with the best open-source vector search and enterprise-ready solutions.",
      ],
      media: "Team",
    },
  ],
  statement:
    "Our team has grown to 100+ experts across 20+ countries, but our mission remains unchanged: building the most scalable, high-performance vector search engine to fuel the future of AI and machine learning.",
  vision: {
    title: "Our Vision",
    text: "To build the most efficient, scalable vector search engine, available as open source and managed cloud services, giving engineers explicit control over how they index, search, and retrieve high-dimensional data.",
  },
  mission: {
    title: "Our Mission",
    text: "To deliver cutting-edge vector search software, available as open-source and scalable cloud services, empowering developers and businesses to unlock the full potential of high-dimensional data.",
  },
}

// Community: the hero's heading and button, and "Discover our Programs". Events has no link on the site.
export const communityPrograms = {
  title: "Join the Qdrant Community",
  description:
    "Connect with over 30,000 community members, get access to educational resources, and stay up to date on all news and discussions about Qdrant and the vector search space.",
  action: { label: "Join our Discord", href: "https://discord.gg/qdrant" },
  items: [
    { icon: "Award", title: "Qdrant Stars", text: "Qdrant Stars are our top contributors, organizers, and evangelists. Learn more about how you can become a Star.", link: { label: "Learn More", href: "/stars/" } },
    { icon: "ShoppingBag", title: "Merch", text: "Get your Qdrant t-shirt, hoodie, and more.", link: { label: "Shop Now", href: "https://www.bystadium.com/us/en/stores/qdrant-swag-for-qdrant-fans-68093/S075175157" } },
    { icon: "Globe", title: "Vector Space Talks", text: "Tech talks with Qdrant users and industry experts.", link: { label: "Join Live or Watch On-demand", href: "https://www.youtube.com/watch?v=4aUq5VnR_VI&list=PL9IXkWSmb36_eANzd_sKeQ3tXbFiEGEWn&pp=iAQB" } },
    { icon: "Rocket", title: "Events", text: "Meet us at upcoming hackathons, meetups, webinars and conferences." },
    { icon: "BookOpen", title: "Contributors Guide", text: "Whatever your strengths are, we got you covered. Learn more about how to contribute to Qdrant.", link: { label: "Learn More", href: "https://github.com/qdrant/qdrant/blob/master/docs/CONTRIBUTING.md" } },
    { icon: "Handshake", title: "Partners", text: "Technology partners and applications that support Qdrant.", link: { label: "Learn More", href: "/partners/" } },
  ] as Channel[],
}

// Stars: "Join our Growing Community", the three channels; the button is the community page's "Join Discord".
export const communityChannels = {
  title: "Join our Growing Community",
  action: { label: "Join Discord", href: "https://discord.com/invite/qdrant" },
  items: [
    { mark: "github", title: "Contribute on GitHub", text: "We’re open source, and always looking to build together.", link: { label: "Start Contributing", href: "https://github.com/qdrant/qdrant" } },
    { mark: "discord", title: "Problem-solve on Discord", text: "Discover and chat with a community of developers.", link: { label: "Join our Conversations", href: "https://qdrant.to/discord" } },
    { mark: "x", title: "Follow on X", text: "Find out about our updates and releases before anyone else.", link: { label: "Spread the Word", href: "https://qdrant.to/twitter" } },
  ] as Channel[],
}

// Community: "What Our Community Members Are Saying". Each quote is cut to its first full sentence.
export const communityWall = {
  title: "What Our Community Members Are Saying",
  action: { label: "Join Discord", href: "https://discord.com/invite/qdrant" },
  quotes: [
    { name: "Owen Colegrove", handle: "@ocolegro", quote: "qdrant has been amazing!" },
    { name: "Darren", handle: "@darrenangle", quote: "qdrant is so fast I'm using Rust for all future projects goodnight everyone" },
    { name: "Greg Schoeninger", handle: "@gregschoeninger", quote: "Indexing millions of embeddings into @qdrant_engine has been the smoothest experience I've had so far with a vector db." },
    { name: "Ifioravanti", handle: "@ivanfioravanti", quote: "@qdrant_engine is ultra super powerful!" },
    { name: "sengpt", handle: "@sengpt", quote: "Qdrant is awesome" },
    { name: "Charlie Greenman", handle: "@razroo_chief", quote: "I am so inspired by Qdrant's performance." },
  ] as CommunityQuote[],
}

// About: "Our Investors". The site shows logos only (alt "Logo"); the names come from their file names
// (avp, bosch-ventures, spark-capital, unusual-ventures, ibb-ventures, 42cap). The funding line is the site's three
// links under them.
export const investors = {
  title: "Our Investors",
  names: ["AVP", "Bosch Ventures", "Spark Capital", "Unusual Ventures", "IBB Ventures", "42CAP"],
  links: [
    { label: "We're Celebrating Series B", href: "/blog/series-b-announcement/" },
    { label: "Read Our Series A Story", href: "/blog/series-a-funding-round/" },
    { label: "Read About Our Seed Funding", href: "/blog/seed-round/" },
  ] as Link[],
}

// Startups: "Why join Qdrant for Startups?", the three benefits.
export const startupBenefits = {
  title: "Why join Qdrant for Startups?",
  action: { label: "Apply Now", href: "#form" },
  items: [
    { icon: "Percent", title: "Discount for Qdrant Cloud", text: "Enjoy a 20% discount on Qdrant Cloud for the first year." },
    { icon: "MessagesSquare", title: "Expert Technical Advice", text: "Get access to sessions with experts for personalized technical advice." },
    { icon: "Gift", title: "Partner Perks", text: "Receive exclusive perks from Hugging Face, LlamaIndex, and Airbyte, ensuring you have access to key tools and resources for AI-driven applications." },
  ] as Principle[],
}

// Stars: "About the Program", the four benefits under its heading.
export const starsBenefits = {
  kicker: "About the Program",
  title: "Everything you need to extend your current reach to be the voice of the developer community and represent Qdrant",
  action: { label: "Become a Star", href: "https://forms.gle/vTuy8Fe9RFdt4SiB9" },
  items: [
    { icon: "GraduationCap", title: "Training", text: "You will be equipped with the assets and knowledge to organize and execute successful talks and events. Get access to our content library with slide decks, templates, and more." },
    { icon: "Award", title: "Recognition", text: "Win a certificate and be featured on our website page. Plus, enjoy the distinction of receiving exclusive Qdrant swag." },
    { icon: "Plane", title: "Travel", text: "Benefit from a dedicated travel fund for speaking engagements at developer conferences." },
    { icon: "FlaskConical", title: "Beta-tests", text: "Get a front-row seat to the future of Qdrant with opportunities to beta-test new releases and access our detailed product roadmap." },
  ] as Principle[],
}
