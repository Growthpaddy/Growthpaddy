export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

export interface SkillCategoryDefinition {
  id: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  allottedMinutes: number;
  passingScorePercent: number;
  questions: QuizQuestion[];
}

export const SKILL_QUIZ_DEFINITIONS: Record<string, SkillCategoryDefinition> = {
  'Paid Media & PPC': {
    id: 'paid-media',
    category: 'Paid Media & PPC',
    shortDesc: 'Meta Ads, Google PMax, bidding algorithms & blended CAC optimization.',
    fullDesc: 'Evaluate your deep expertise in campaign architecture, Google Performance Max strategies, Target ROAS algorithmic bidding, Meta creative testing frameworks, and blended acquisition economics.',
    iconName: 'TrendingUp',
    allottedMinutes: 10,
    passingScorePercent: 80,
    questions: [
      {
        id: 'pm-1',
        question: 'When scaling a Meta Ads Advantage+ Shopping Campaign (ASC), your blended CPA spikes by 45% after increasing budget by 60% in a single day. What is the recommended remediation protocol?',
        options: [
          'Immediately pause all ASC campaigns and switch to manual cost caps with broad targeting.',
          'Reset daily spend increments to 15-20% every 48-72 hours to prevent resetting the ad set learning phase.',
          'Duplicate the ASC campaign 5 times at lower budgets to circumvent audience saturation.',
          'Turn off conversion tracking pixel deduplication to give the algorithm more raw signal.'
        ],
        correctIdx: 1,
        explanation: 'Meta auction algorithms require steady budget pacing. Large sudden increases (>20%) force the auction into sub-optimal high-CPM auctions during learning.'
      },
      {
        id: 'pm-2',
        question: 'In Google Ads Performance Max (PMax) campaigns, how do you prevent brand-keyword cannibalization without losing search volume?',
        options: [
          'Exclude your website root domain in the campaign placement exclusion list.',
          'Apply Brand Lists as exclusions at the PMax campaign level and capture brand terms in a dedicated exact-match Search campaign.',
          'Set Target CPA to $1.00 on the PMax campaign to suppress brand bids.',
          'Delete image assets from the PMax asset group to force standard shopping bids.'
        ],
        correctIdx: 1,
        explanation: 'Applying brand exclusions via Google Brand Lists ensures PMax focuses purely on incremental non-brand discovery while maintaining clean brand search control.'
      },
      {
        id: 'pm-3',
        question: 'What is the primary mechanical benefit of configuring server-side Meta Conversions API (CAPI) with redundant browser Pixel events and Event Deduplication?',
        options: [
          'It eliminates the need for privacy policy consent banners.',
          'It reclaims lost browser signals (ad blockers, iOS ITP) while preventing duplicate transaction counting via event_id matching.',
          'It guarantees a flat 10x ROAS across retargeting audiences.',
          'It automatically writes ad copy using machine learning.'
        ],
        correctIdx: 1,
        explanation: 'CAPI paired with deduplication matches server and browser payloads by event_id, recovering 20-30% of lost signal while avoiding double reporting.'
      },
      {
        id: 'pm-4',
        question: 'Which metric best indicates creative fatigue in high-volume paid social campaigns before CPA rises significantly?',
        options: [
          'Ad Frequency combined with declining Hook Rate (3s video views / Impressions) and rising outbound CPC.',
          'Total Impressions count over 30 days.',
          'Page Likes and post share counts.',
          'Google Analytics direct session bounce rate.'
        ],
        correctIdx: 0,
        explanation: 'When frequency climbs while hook rate drops and outbound CPC rises, audiences have tired of the hook, signaling creative fatigue.'
      },
      {
        id: 'pm-5',
        question: 'When testing 20 new ad creatives weekly, which structure provides the cleanest statistical separation without fragmenting campaign budget?',
        options: [
          'Place all 20 creatives directly into the live primary scaling campaign simultaneously.',
          'Use a dedicated Dynamic Creative Test (DCT) or Sandbox ad set at 20% budget, promoting validated winners to the main Scaling CBO.',
          'Create 20 distinct campaigns with $5 daily budgets each.',
          'Run them as boost posts on Instagram directly.'
        ],
        correctIdx: 1,
        explanation: 'A structured Sandbox or DCT environment isolates testing variables without cannibalizing the main budget algorithm, allowing clean winner graduation.'
      }
    ]
  },
  'SEO & Organic Growth': {
    id: 'seo-growth',
    category: 'SEO & Organic Growth',
    shortDesc: 'Technical crawling, programmatic architectures, entity SEO & link velocity.',
    fullDesc: 'Tests technical crawl optimization, programmatic SEO schema generation, topical authority mapping, Core Web Vitals, and search intent clustering.',
    iconName: 'Globe',
    allottedMinutes: 10,
    passingScorePercent: 80,
    questions: [
      {
        id: 'seo-1',
        question: 'A SaaS platform experiences a drop in organic rankings. Google Search Console reports: "Duplicate without user-selected canonical". What is the definitive resolution?',
        options: [
          'Add a meta robots "noindex, follow" tag to all variant URLs.',
          'Implement self-referential or authoritative rel="canonical" tags on all canonical pages and point variants to the primary URL.',
          'Disallow parameter URLs inside robots.txt to stop crawling entirely.',
          'Change the domain name and submit a change-of-address request.'
        ],
        correctIdx: 1,
        explanation: 'Explicit rel="canonical" link headers consolidate page authority signals and eliminate algorithmic ambiguity in Google index pipelines.'
      },
      {
        id: 'seo-2',
        question: 'Which method represents the most effective architecture for programmatic SEO without triggering low-quality or thin content penalties?',
        options: [
          'Scraping competitor paragraphs and rewriting them with spinning tools.',
          'Combining structured database entities with unique proprietary datasets, schema markups, and human-in-the-loop editorial curation.',
          'Auto-generating 50,000 doorway pages with identical text and differing city names.',
          'Embedding white-on-white text keywords in the footer HTML.'
        ],
        correctIdx: 1,
        explanation: 'High-value programmatic SEO relies on unique proprietary data layers, structured JSON-LD schemas, and genuine user utility per landing page.'
      },
      {
        id: 'seo-3',
        question: 'To optimize Core Web Vitals, which metric is primarily influenced by reducing render-blocking third-party scripts and optimizing Largest Contentful Paint (LCP)?',
        options: [
          'LCP speed (target < 2.5s) and Interaction to Next Paint (INP).',
          'Domain Authority (DA).',
          'Keyword ranking positions exclusively.',
          'XML Sitemap validation speed.'
        ],
        correctIdx: 0,
        explanation: 'LCP measures perceived load speed (<2.5s benchmark), and minimizing JavaScript execution blocks directly accelerates both LCP and INP.'
      },
      {
        id: 'seo-4',
        question: 'What is the primary role of JSON-LD Schema (e.g., Organization, Product, Article, FAQPage) in modern Google search algorithms?',
        options: [
          'It guarantees an immediate number 1 rank on target keywords.',
          'It provides unambiguous machine-readable entity definitions, increasing eligibility for rich snippets and Knowledge Graph inclusion.',
          'It hides private URLs from competitor scrapers.',
          'It replaces the need for on-page H1 and title tags.'
        ],
        correctIdx: 1,
        explanation: 'Structured schema removes entity ambiguity for LLMs and search parsers, dramatically improving rich snippet SERP real estate.'
      },
      {
        id: 'seo-5',
        question: 'When migrating an existing high-traffic domain to a new URL structure, what status code must be permanently implemented on legacy routes to transfer Link Equity (PageRank)?',
        options: [
          '302 Found (Temporary Redirect)',
          '301 Moved Permanently',
          '307 Temporary Redirect',
          '410 Content Deleted'
        ],
        correctIdx: 1,
        explanation: '301 redirects instruct search bots that the resource has permanently moved, passing forward the historical backlink authority and index weight.'
      }
    ]
  },
  'CRO & Conversion Optimization': {
    id: 'cro-optimization',
    category: 'CRO & Conversion Optimization',
    shortDesc: 'A/B testing protocols, statistical significance, heuristics & UX funnel design.',
    fullDesc: 'Covers conversion rate optimization methodology, quantitative drop-off analysis, user friction audits, hypothesis formulation, and sample size statistical significance.',
    iconName: 'Layers',
    allottedMinutes: 10,
    passingScorePercent: 80,
    questions: [
      {
        id: 'cro-1',
        question: 'An A/B test on a high-traffic checkout page achieves a 12% conversion lift with a p-value of 0.03 after 2 days of testing. Why should you NOT declare a winner yet?',
        options: [
          'Because 12% lift is mathematically too high for e-commerce.',
          'Underpowered early results suffer from the "peeking problem" and cyclical day-of-week biases; you must reach the predetermined sample size and at least 1-2 full business cycles.',
          'Because p-value must be exactly 0.000 to be significant.',
          'A/B tests must run for exactly 365 days regardless of volume.'
        ],
        correctIdx: 1,
        explanation: 'Stopping tests early when significance is first reached produces false positives (peeking problem). Pre-calculated sample size and full weekly cycles are essential.'
      },
      {
        id: 'cro-2',
        question: 'According to MECLABS heuristic formula (C = 4m + 3v + 2(i-f) - 2a), what is the single most influential variable affecting user conversion decision?',
        options: [
          'Anxiety (a)',
          'Motivation of the user (m)',
          'Friction in the checkout form (f)',
          'Incentive discounts (i)'
        ],
        correctIdx: 1,
        explanation: 'Motivation (4m) carries the highest coefficient weight in the conversion probability equation, followed by the Clarity of the Value Proposition (3v).'
      },
      {
        id: 'cro-3',
        question: 'Which quantitative technique should be prioritized to identify checkout drop-off friction before conducting qualitative heatmaps?',
        options: [
          'Event-based Funnel Drop-off Analysis mapping step-by-step conversion transitions in GA4 or PostHog.',
          'Running a brand survey on Twitter.',
          'Redesigning the entire navigation bar blindly.',
          'Adding exit-intent popups on all pages.'
        ],
        correctIdx: 0,
        explanation: 'Funnel drop-off visualization pinpoints the exact micro-step losing visitors, focusing optimization efforts where value leakage is highest.'
      },
      {
        id: 'cro-4',
        question: 'What is the most effective approach to reducing form friction on B2B lead generation landing pages?',
        options: [
          'Increase required fields from 4 to 12 to filter for only high-intent leads.',
          'Implement multi-step progressive disclosure forms with smart field enrichment (Clearbit/Apollo) and clear micro-commitments.',
          'Remove the submit button entirely and use voice recognition.',
          'Force users to sign in with Google before seeing the landing page.'
        ],
        correctIdx: 1,
        explanation: 'Multi-step progressive forms reduce perceived cognitive load upfront while API enrichment backfills company data behind the scenes.'
      },
      {
        id: 'cro-5',
        question: 'When running an advertorial presell landing page for cold paid traffic, what is its primary conversion objective?',
        options: [
          'Direct checkout purchase without viewing the product page.',
          'Educate, build problem-awareness, handle objections, and bridge warm intent to the main sales page with high CTR.',
          'Collect email addresses only for a 60-day newsletter sequence.',
          'Display banner ads for external ad network revenue.'
        ],
        correctIdx: 1,
        explanation: 'Advertorials bridge cold traffic by educating on the core problem and agitating value, priming higher qualification and intent for the target offer.'
      }
    ]
  },
  'Analytics & Attribution': {
    id: 'analytics-attribution',
    category: 'Analytics & Attribution',
    shortDesc: 'GA4, server-side GTM, attribution modeling, cohort LTV & SQL pipelines.',
    fullDesc: 'Evaluates expertise in web measurement protocols, data layer implementation, first-party cookie architecture, multi-touch attribution, and retention cohort analytics.',
    iconName: 'Cpu',
    allottedMinutes: 10,
    passingScorePercent: 80,
    questions: [
      {
        id: 'ana-1',
        question: 'In GA4 event data models, what replaces the traditional Universal Analytics "Category / Action / Label / Value" hierarchical schema?',
        options: [
          'Pageview clusters and hit types.',
          'A flat event-driven model with custom event names and flexible event parameters.',
          'Session cookies stored in local browser caches.',
          'SQL views generated once per day.'
        ],
        correctIdx: 1,
        explanation: 'GA4 utilizes a flexible, uniform event-parameter paradigm where every interaction (page view, scroll, purchase) is an event with up to 25 custom parameters.'
      },
      {
        id: 'ana-2',
        question: 'Why is Server-Side Google Tag Manager (sGTM) hosted on a custom first-party subdomain (e.g. data.yourdomain.com) superior to client-side JS tags?',
        options: [
          'It makes all website traffic 100% anonymous.',
          'It writes first-party HttpOnly cookies resistant to browser ITP wipeouts, speeds up client page rendering, and hides sensitive API keys.',
          'It allows tracking users who have no internet connection.',
          'It completely removes the need for data analytics specialists.'
        ],
        correctIdx: 1,
        explanation: 'sGTM on a custom domain extends first-party cookie lifecycles, unburdens the client browser CPU, and sanitizes outgoing PII before dispatch.'
      },
      {
        id: 'ana-3',
        question: 'What is the primary drawback of relying exclusively on Last-Non-Direct-Click attribution for paid media investment decisions?',
        options: [
          'It undervalues top-of-funnel discovery channels (like cold Paid Social & Video) and overcredits bottom-of-funnel capture channels (Brand Search & Retargeting).',
          'It cannot record e-commerce revenue figures accurately.',
          'It requires manual spreadsheet exports every hour.',
          'It only works for mobile application installs.'
        ],
        correctIdx: 0,
        explanation: 'Last-click models award 100% credit to the closing touchpoint, starving upper-funnel growth channels of budget despite generating the original intent.'
      },
      {
        id: 'ana-4',
        question: 'How is Customer Acquisition Cost (CAC) calculated accurately from a blended financial standpoint?',
        options: [
          'Total Meta Ads spend divided by Facebook platform reported conversions.',
          'Total Sales & Marketing expenses (Ad Spend + Salaries + Agency Fees + Tooling) over a given period divided by New Customers Acquired in that same period.',
          'Average Order Value multiplied by Conversion Rate.',
          'Gross Revenue divided by Total Traffic Visitors.'
        ],
        correctIdx: 1,
        explanation: 'True blended CAC incorporates fully-loaded sales and marketing overhead against net new unique customer acquisition.'
      },
      {
        id: 'ana-5',
        question: 'When analyzing customer retention, why is a Triangular Cohort Retention Matrix preferred over simple overall Monthly Active Users (MAU)?',
        options: [
          'Because MAU hides underlying churn when top-of-funnel acquisition volume is high, whereas cohorts track the lifecycle decay of specific signup groups over time.',
          'Because MAU is too complex for executive stakeholders to read.',
          'Cohorts only work for B2B SaaS companies with annual contracts.',
          'Triangular matrices automatically refund cancelled customer payments.'
        ],
        correctIdx: 0,
        explanation: 'Cohort matrices isolate behavioral decay over time for specific customer cohorts, immediately revealing whether product improvements are reducing churn.'
      }
    ]
  },
  'AI & Automation Strategy': {
    id: 'ai-automation',
    category: 'AI & Automation Strategy',
    shortDesc: 'LLM agents, workflow orchestrators (n8n/Make), prompt engineering & dynamic pipelines.',
    fullDesc: 'Evaluates your ability to engineer automated growth operations, deploy agentic AI loops, build webhook integrations, and optimize marketing efficiency using modern AI tooling.',
    iconName: 'Sparkles',
    allottedMinutes: 10,
    passingScorePercent: 80,
    questions: [
      {
        id: 'ai-1',
        question: 'Your automation workflow inside Make.com or n8n times out when handling a large 40MB response payload from a web scraper. What is the production-grade architectural pattern to resolve this?',
        options: [
          'Immediately respond with HTTP 202 Accepted at the webhook ingress and offload compute to asynchronous background queues or chunked streaming workers.',
          'Add a 30-second delay sleep block directly inside the synchronous webhook handler.',
          'Increase the browser tab timeout in your local browser.',
          'Encode the entire binary file into an email attachment and resend.'
        ],
        correctIdx: 0,
        explanation: 'Returning 202 Accepted decouples ingress timeout constraints from heavy background compute jobs, ensuring reliable automated ingestion.'
      },
      {
        id: 'ai-2',
        question: 'When deploying Gemini or OpenAI models for programmatic content generation, how do you strictly guarantee that the output parses without JSON syntax errors?',
        options: [
          'Include the words "Please format cleanly as JSON" in the prompt body.',
          'Enforce structured outputs via Schema Validation (such as responseSchema in Google GenAI SDK or JSON Schema mode in OpenAI).',
          'Wrap the response string in a regex replace for commas.',
          'Prompt the AI model to check its own grammar twice.'
        ],
        correctIdx: 1,
        explanation: 'Structured schema enforcement at the model engine level guarantees valid typed JSON objects adhering to your specified interface.'
      },
      {
        id: 'ai-3',
        question: 'What is the primary advantage of utilizing self-hosted n8n instances over standard commercial SaaS automation platforms for enterprise scale?',
        options: [
          'Execution of multi-step AI node pipelines and high-frequency webhook loops without per-task execution fees or third-party data egress risks.',
          'Elimination of the need for API access keys.',
          'It automatically writes all marketing emails without prompts.',
          'It guarantees 100% email deliverability into the primary inbox.'
        ],
        correctIdx: 0,
        explanation: 'Self-hosted workflow orchestrators offer cost efficiency at millions of tasks while maintaining complete data sovereignty behind your VPC.'
      },
      {
        id: 'ai-4',
        question: 'What is Retrieval-Augmented Generation (RAG) and why is it essential for custom marketing AI assistants?',
        options: [
          'A graphic design model that renders logos automatically.',
          'A system that retrieves relevant contextual chunks from a proprietary vector database and injects them into the prompt, preventing hallucination with factual company knowledge.',
          'A technique to bypass Google ad approval systems.',
          'An algorithm that sends automatic SMS messages at midnight.'
        ],
        correctIdx: 1,
        explanation: 'RAG grounds foundation models on real company documentation and past campaign data, delivering accurate domain responses without hallucinations.'
      },
      {
        id: 'ai-5',
        question: 'In AI-assisted cold outreach automation, what strategy maximizes deliverability and prevents domain reputation blacklisting?',
        options: [
          'Sending 5,000 cold emails daily from your primary company root domain on Day 1.',
          'Using secondary lookalike domains, strict SPF/DKIM/DMARC configurations, automated inbox warming, and AI personalization based on prospect data.',
          'Buying email lists and BCC-ing 500 contacts per blast.',
          'Writing emails in all-caps with multiple exclamation marks.'
        ],
        correctIdx: 1,
        explanation: 'Isolating secondary domains with authenticated DNS records and gradual volume warmup protects the root corporate email reputation.'
      }
    ]
  },
  'Email & Lifecycle Automation': {
    id: 'email-lifecycle',
    category: 'Email & Lifecycle Automation',
    shortDesc: 'Klaviyo, HubSpot, customer journey segmentation & automated retention engines.',
    fullDesc: 'Tests retention workflows, RFM segmentation models, transactional triggers, inbox deliverability compliance, and customer lifetime value (LTV) maximization.',
    iconName: 'Mail',
    allottedMinutes: 10,
    passingScorePercent: 80,
    questions: [
      {
        id: 'em-1',
        question: 'In e-commerce lifecycle marketing (Klaviyo), which automated flow typically generates the highest revenue per recipient (RPR)?',
        options: [
          'Monthly Newsletter broadcast',
          'High-Intent Abandoned Checkout Flow with SMS follow-up and dynamic cart item previews',
          'Annual Birthday Greeting email',
          'Product catalog update announcement'
        ],
        correctIdx: 1,
        explanation: 'Abandoned checkout sequences target shoppers with peak purchase intent, yielding the highest revenue per recipient of any core lifecycle flow.'
      },
      {
        id: 'em-2',
        question: 'To comply with Gmail and Yahoo 2024 Sender Requirements for bulk senders, which protocols are strictly mandatory?',
        options: [
          'Sending from a free @gmail.com address.',
          'Configured SPF, DKIM, and DMARC policies, one-click list-unsubscribe headers, and keeping spam complaint rates below 0.3%.',
          'Including animated GIFs in every email header.',
          'Removing the unsubscribe link from promotional emails.'
        ],
        correctIdx: 1,
        explanation: 'Major inbox providers strictly enforce authenticated DNS alignment (SPF, DKIM, DMARC) and low spam complaint ceilings (<0.3%) for inbox delivery.'
      },
      {
        id: 'em-3',
        question: 'What is RFM Segmentation in lifecycle CRM strategy and how should it be applied?',
        options: [
          'Radio Frequency Modulation for podcast sponsorships.',
          'Recency, Frequency, and Monetary value scoring to categorize customers into VIPs, Promising, At-Risk, and Churned segments for targeted automated campaigns.',
          'A method to scrape emails from LinkedIn profiles.',
          'A server load balancing algorithm for database servers.'
        ],
        correctIdx: 1,
        explanation: 'RFM analysis groups customers based on purchase behavior, allowing customized messaging that reactivates churning users and rewards high-LTV VIPs.'
      },
      {
        id: 'em-4',
        question: 'What is the optimal timing window for triggering a "Post-Purchase Cross-Sell / Replenishment" email flow for consumable products?',
        options: [
          '5 minutes after the first order is placed.',
          'Calculated around the expected product depletion date (e.g. 21-25 days into a 30-day supply cycle) based on average consumption rates.',
          'Exactly 365 days after the order.',
          'Whenever the marketing manager remembers to send it.'
        ],
        correctIdx: 1,
        explanation: 'Replenishment flows timed right before expected supply depletion capture high re-order conversion rates before customers seek alternative brands.'
      },
      {
        id: 'em-5',
        question: 'What is the most effective method to clean an inactive email list without sacrificing active deliverability?',
        options: [
          'Send a batch to all inactive users with a 90% discount code.',
          'Run an automated Sunset Flow (30/60/90 day unengaged), ask for opt-in confirmation, and automatically suppress or delete non-responders.',
          'Export unengaged emails and upload them to a new ESP.',
          'Ignore inactive subscribers because list size is all that matters.'
        ],
        correctIdx: 1,
        explanation: 'Regular sunset workflows purge chronic non-openers, protecting sender domain reputation and elevating inbox placement for active subscribers.'
      }
    ]
  },
  'Growth Marketing Strategy': {
    id: 'growth-strategy',
    category: 'Growth Marketing Strategy',
    shortDesc: 'North Star metrics, Pirate Metrics (AARRR), growth loops & experiment velocity.',
    fullDesc: 'Evaluates your strategic capacity to design scalable growth loops, prioritize high-impact experiments (ICE/RICE), and drive compound customer acquisition.',
    iconName: 'TrendingUp',
    allottedMinutes: 10,
    passingScorePercent: 80,
    questions: [
      {
        id: 'gs-1',
        question: 'What differentiates a self-sustaining "Growth Loop" from a traditional linear "Growth Funnel"?',
        options: [
          'Growth loops require zero marketing budget forever.',
          'The output of one cycle (e.g., a new user invited, a UGC post created) serves as the primary input to generate the next batch of users, driving compound reinvestment.',
          'Growth loops only work for social media influencers.',
          'Funnels are outdated and should never be measured.'
        ],
        correctIdx: 1,
        explanation: 'Growth loops create compound momentum where actions taken by existing cohorts inherently acquire or activate incoming cohorts.'
      },
      {
        id: 'gs-2',
        question: 'When prioritizing growth marketing experiments using the ICE framework, what does the acronym stand for?',
        options: [
          'Investment, Cost, Efficiency',
          'Impact, Confidence, Ease',
          'Innovation, Creativity, Execution',
          'Iteration, Conversion, Engagement'
        ],
        correctIdx: 1,
        explanation: 'ICE scores (Impact, Confidence, Ease from 1-10) offer an objective, rapid framework to rank backlog ideas by expected ROI and velocity.'
      },
      {
        id: 'gs-3',
        question: 'In the Pirate Metrics framework (AARRR), which stage is universally acknowledged by growth leaders as the prerequisite foundation before scaling Acquisition?',
        options: [
          'Acquisition',
          'Retention (Product-Market Fit & Value Stickiness)',
          'Referral',
          'Revenue'
        ],
        correctIdx: 1,
        explanation: 'Acquiring users into a leaky bucket with poor retention burns capital; solid cohort retention curves must exist before scaling paid acquisition.'
      },
      {
        id: 'gs-4',
        question: 'What is a "North Star Metric" (NSM) and why is it vital for cross-functional alignment?',
        options: [
          'The total number of followers on the brand Instagram page.',
          'The single key metric that best captures the core value delivered to customers and directly predicts long-term business sustainability.',
          'The CEO annual salary target.',
          'The daily Google Analytics pageview count.'
        ],
        correctIdx: 1,
        explanation: 'A North Star Metric unites product, marketing, and engineering teams around delivering genuine customer value that drives compounding growth.'
      },
      {
        id: 'gs-5',
        question: 'How should growth teams establish an optimal experimentation cadence for high-growth startups?',
        options: [
          'Launch 1 major subjective website redesign every 18 months.',
          'Run a structured weekly growth sprint cycle: hypothesize, prioritize via RICE, ship 3-5 rapid experiments, analyze quantitative outcomes, and institutionalize learnings.',
          'Only test ideas approved by the executive board in quarterly meetings.',
          'Change ad copy randomly whenever sales dip on a Tuesday.'
        ],
        correctIdx: 1,
        explanation: 'Consistent experimentation velocity with rigorous learning loops is the primary engine separating market-leading growth teams from competitors.'
      }
    ]
  },
  'Full-Stack Digital Marketing': {
    id: 'full-stack-marketing',
    category: 'Full-Stack Digital Marketing',
    shortDesc: 'End-to-end multi-channel orchestration, brand positioning & budget allocation.',
    fullDesc: 'Tests your comprehensive ability to synthesize paid channels, organic search, creative operations, CRO, and lifecycle retention into a unified growth engine.',
    iconName: 'Award',
    allottedMinutes: 10,
    passingScorePercent: 80,
    questions: [
      {
        id: 'fs-1',
        question: 'When allocating a $100,000 monthly growth budget across a mature direct-to-consumer brand, how should channels be strategically weighted?',
        options: [
          '100% on TikTok influencer sponsorships with no tracking.',
          '60-70% on proven scalable performance channels (Paid Social/Search), 20% on lifecycle retention & CRO, and 10-20% on experimental high-upside discovery channels.',
          '100% on print newspaper advertisements.',
          'Divide evenly into $1,000 chunks across 100 random platforms.'
        ],
        correctIdx: 1,
        explanation: 'The 70/20/10 capital allocation framework safeguards baseline revenue predictability while funding retention enhancements and emerging discovery channels.'
      },
      {
        id: 'fs-2',
        question: 'What is the role of a Marketing Mix Modeling (MMM) regression analysis alongside deterministic attribution?',
        options: [
          'It replaces the need for any tracking cookies or Google Analytics entirely.',
          'It applies statistical econometrics to evaluate top-down channel elasticity, incrementality, and offline/brand spillover without cookie dependency.',
          'It designs landing page graphic assets in Canva.',
          'It sends automated Slack messages to sales reps.'
        ],
        correctIdx: 1,
        explanation: 'MMM uses macro-economic regression on spend and revenue signals to measure true incrementality independent of privacy tracking restrictions.'
      },
      {
        id: 'fs-3',
        question: 'What is the fastest way to validate customer positioning for a new product launch before building full campaigns?',
        options: [
          'Launch rapid message-testing landing pages with paid search/social micro-budgets measuring CTR, opt-in rate, and willingness-to-pay intent.',
          'Commission a 6-month academic study.',
          'Ask family and friends for feedback.',
          'Publish a press release in a local newspaper.'
        ],
        correctIdx: 0,
        explanation: 'Direct behavioral split-testing with small ad spends yields objective quantitative feedback on which value propositions resonate in the market.'
      },
      {
        id: 'fs-4',
        question: 'In omnichannel marketing, what is the primary benefit of coordinating paid search bids with high-converting organic SEO rankings?',
        options: [
          'Dominate both paid and organic real estate on high-intent SERP queries, capturing up to 80% of total click share for brand and non-brand queries.',
          'It reduces web hosting costs on AWS.',
          'It automatically deletes negative online reviews.',
          'It forces Google to disable competitor ads.'
        ],
        correctIdx: 0,
        explanation: 'Securing top paid and organic positions dominates the search engine fold, maximizing brand trust and aggregate category capture.'
      },
      {
        id: 'fs-5',
        question: 'Which factor is most critical when scaling an omnichannel creative production pipeline?',
        options: [
          'Hiring Hollywood directors for every 15-second video.',
          'A modular creative testing engine producing continuous variations in hooks, angles, pain points, and formats based on quantitative ad performance data.',
          'Using the exact same image asset across all platforms for 3 years.',
          'Only posting text updates without images or video.'
        ],
        correctIdx: 1,
        explanation: 'Modular creative testing feeds algorithmic ad platforms with fresh variation, rapidly isolating winning angles that lower customer acquisition costs.'
      }
    ]
  },
  'General Digital Marketing': {
    id: 'general-marketing',
    category: 'General Digital Marketing',
    shortDesc: 'Marketing foundations, campaign planning, audience persona & brand equity.',
    fullDesc: 'Covers foundational digital marketing principles, value proposition design, customer journey mapping, multi-channel messaging, and performance KPIs.',
    iconName: 'BookOpen',
    allottedMinutes: 10,
    passingScorePercent: 80,
    questions: [
      {
        id: 'gm-1',
        question: 'What is the difference between Customer Lifetime Value (LTV) and Average Order Value (AOV)?',
        options: [
          'They are identical financial metrics.',
          'AOV is the average dollar amount spent in a single transaction, while LTV represents the total cumulative net profit or revenue generated over the entire customer relationship.',
          'LTV is only measured in months, while AOV is measured in days.',
          'AOV applies to B2B software, while LTV applies to retail stores.'
        ],
        correctIdx: 1,
        explanation: 'AOV measures single-cart volume, while LTV aggregates repeat purchases and retention over the entire customer lifecycle.'
      },
      {
        id: 'gm-2',
        question: 'Which metric best reflects the true profitability of paid advertising campaigns after subtracting cost of goods sold (COGS)?',
        options: [
          'Total Page Views',
          'Marketing Efficiency Ratio (MER) and Contribution Margin (POAS - Profit On Ad Spend)',
          'Total Social Media Followers',
          'Impression Share Percentage'
        ],
        correctIdx: 1,
        explanation: 'Profit On Ad Spend (POAS) and Contribution Margin measure true bottom-line cash generation by incorporating product costs and operational expenses.'
      },
      {
        id: 'gm-3',
        question: 'What is the primary purpose of developing detailed Customer Buyer Personas?',
        options: [
          'To decorate internal office slides with fictional photos.',
          'To align copy, creative hooks, channel selection, and value propositions directly with the specific pain points, desires, and behavioral triggers of target buyers.',
          'To fill out HR compliance checklists.',
          'To automate email sending servers.'
        ],
        correctIdx: 1,
        explanation: 'Accurate buyer personas anchor messaging in the psychology and real-world triggers of ideal customers, elevating conversion rates across all channels.'
      },
      {
        id: 'gm-4',
        question: 'What is the role of an effective Call-to-Action (CTA) on digital landing pages?',
        options: [
          'To confuse visitors with 15 competing options.',
          'To provide a singular, low-friction, high-clarity next step that explicitly states the value the user will receive upon clicking.',
          'To redirect visitors to the homepage.',
          'To hide the pricing details until checkout.'
        ],
        correctIdx: 1,
        explanation: 'High-converting CTAs are explicit, singular in focus, and convey the immediate benefit the user will unlock upon engagement.'
      },
      {
        id: 'gm-5',
        question: 'Why is A/B testing copy headlines typically the highest-leverage initial test on a marketing landing page?',
        options: [
          'Because 80% of readers only read the headline before deciding whether to stay or bounce, making headline resonance the gateway to the entire funnel.',
          'Because changing text requires no design effort.',
          'Headlines are the only element search engines can crawl.',
          'Because images have no impact on user psychology.'
        ],
        correctIdx: 0,
        explanation: 'The headline is the first cognitive checkpoint for visitors; optimizing headline alignment with ad intent immediately improves engagement and scroll depth.'
      }
    ]
  }
};
