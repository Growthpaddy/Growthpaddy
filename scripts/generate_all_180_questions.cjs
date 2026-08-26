const fs = require('fs');
const path = require('path');

function esc(str) {
  return str.replace(/'/g, "''");
}

function createSqlInsert(q) {
  const optionsJson = JSON.stringify(q.options);
  return `INSERT INTO public.quiz_questions (skill_category, difficulty, question_text, options, correct_option_id, is_active)
VALUES (
  '${esc(q.skill_category)}',
  '${esc(q.difficulty)}',
  '${esc(q.question_text)}',
  '${esc(optionsJson)}'::jsonb,
  '${esc(q.correct_option_id)}',
  true
);`;
}

const rawData = [];

// Helper to add a question
function addQ(category, difficulty, questionText, optA, optB, optC, optD, correctId) {
  rawData.push({
    skill_category: category,
    difficulty: difficulty,
    question_text: questionText,
    options: [
      { id: 'a', text: optA },
      { id: 'b', text: optB },
      { id: 'c', text: optC },
      { id: 'd', text: optD }
    ],
    correct_option_id: correctId,
    is_active: true
  });
}

// ==============================================================================
// 1. FULL-STACK DIGITAL MARKETING (20 Questions)
// ==============================================================================
// Beginner (1-7)
addQ(
  "Full-Stack Digital Marketing", "beginner",
  "Which stage of the traditional AIDA marketing funnel focuses primarily on educating consumers about a brand's solution to their problem?",
  "Action", "Interest", "Desire", "Advocacy", "b"
);
addQ(
  "Full-Stack Digital Marketing", "beginner",
  "What does the metric 'CTR' represent in digital advertising campaigns?",
  "Cost To Reach", "Click-Through Rate", "Conversion Traffic Ratio", "Customer Transaction Rate", "b"
);
addQ(
  "Full-Stack Digital Marketing", "beginner",
  "Which standalone web asset is built specifically to receive campaign traffic and prompt a single targeted action?",
  "Homepage", "Landing Page", "Sitemap XML", "About Us Page", "b"
);
addQ(
  "Full-Stack Digital Marketing", "beginner",
  "What is the primary role of a Meta Pixel or tracking tag on an e-commerce website?",
  "Compress website images automatically", "Track user interactions and measure conversion performance", "Manage website DNS records", "Host product catalog images", "b"
);
addQ(
  "Full-Stack Digital Marketing", "beginner",
  "In inbound marketing, what is the term for a free, high-value asset offered in exchange for a prospect's email address?",
  "Tracking Cookie", "Lead Magnet", "Backlink", "Ad Snippet", "b"
);
addQ(
  "Full-Stack Digital Marketing", "beginner",
  "Which metric calculates the percentage of visitors who navigate away from a site after viewing only a single page?",
  "Churn Rate", "Bounce Rate", "Retention Rate", "Conversion Rate", "b"
);
addQ(
  "Full-Stack Digital Marketing", "beginner",
  "What is the core distinction between organic and paid marketing channels?",
  "Organic traffic is earned through search rankings and content; paid traffic is acquired via ad auctions", "Organic traffic only comes from email, while paid traffic comes from Google", "Organic marketing requires zero operational time or effort", "Paid marketing cannot be tracked with UTM parameters", "a"
);

// Intermediate (8-15)
addQ(
  "Full-Stack Digital Marketing", "intermediate",
  "If a business achieves a Customer Lifetime Value (LTV) of $900 with a Customer Acquisition Cost (CAC) of $300, what is the LTV:CAC ratio and its business implication?",
  "1:3 ratio, indicating critical overspending on marketing", "3:1 ratio, representing a healthy, sustainable unit economics benchmark", "0.33 ratio, requiring immediate campaign shutdown", "6:1 ratio, suggesting an unsustainable burn rate", "b"
);
addQ(
  "Full-Stack Digital Marketing", "intermediate",
  "What are the three core architectural components of Google Tag Manager (GTM)?",
  "Tags, Triggers, and Variables", "Headers, Footers, and Scripts", "Keywords, Bids, and Ad Groups", "Segments, Funnels, and Cohorts", "a"
);
addQ(
  "Full-Stack Digital Marketing", "intermediate",
  "Scenario: A D2C brand sees high top-of-funnel traffic from video ads, but add-to-cart conversion is under 1%. What is the most effective full-stack marketing action?",
  "Double the top-of-funnel ad spend immediately", "Audit mobile product page speed, clarify shipping policies, and add clear social proof above the fold", "Disable all analytics tracking pixels", "Delete product descriptions to minimize text", "b"
);
addQ(
  "Full-Stack Digital Marketing", "intermediate",
  "What is the primary function of UTM parameters appended to digital marketing links?",
  "To encrypt payment information at checkout", "To pass campaign source, medium, name, and term data into analytics platforms", "To speed up website server response time", "To bypass ad block filters", "b"
);
addQ(
  "Full-Stack Digital Marketing", "intermediate",
  "What key characteristic differentiates true omnichannel marketing from multi-channel marketing?",
  "Omnichannel synchronizes customer data and user experience seamlessly across all channels; multi-channel runs isolated channels", "Multi-channel only uses online ads, while omnichannel is offline only", "Omnichannel requires zero digital advertising tools", "There is no difference between the two terms", "a"
);
addQ(
  "Full-Stack Digital Marketing", "intermediate",
  "Scenario: A B2B company wants to leverage SEO and LinkedIn Ads together. What represents the strongest full-stack workflow?",
  "Gate all informational blog articles behind payment forms", "Attract organic searchers with ungated high-intent guides, build remarketing audiences, and retarget them on LinkedIn with case studies", "Target competitor brand keywords on LinkedIn and redirect to home page", "Send generic cold LinkedIn InMails to every website visitor", "b"
);
addQ(
  "Full-Stack Digital Marketing", "intermediate",
  "Which metric evaluates the total gross margin or profit earned per dollar of ad spend rather than top-line revenue?",
  "ROAS (Return on Ad Spend)", "POAS (Profit on Ad Spend)", "CPM (Cost Per Thousand)", "CPA (Cost Per Acquisition)", "b"
);
addQ(
  "Full-Stack Digital Marketing", "intermediate",
  "What is the primary role of a Customer Data Platform (CDP) like Segment in modern marketing engineering?",
  "To serve as the main web application hosting server", "To collect, standardize, and route customer event data to downstream analytics, CRM, and ad platforms", "To auto-generate display ad graphics", "To manage domain name DNS records", "b"
);

// Advanced (16-20)
addQ(
  "Full-Stack Digital Marketing", "advanced",
  "Scenario: Due to browser privacy restrictions (ITP) and third-party cookie loss, client-side pixel accuracy has degraded by 30%. What infrastructure change recovers data fidelity?",
  "Rely exclusively on URL hash parameters", "Implement Server-Side Tagging (sGTM) with first-party custom domain mapping and Conversions API (CAPI)", "Force users to fill out self-reporting surveys on every page", "Switch all campaigns exclusively to offline radio advertising", "b"
);
addQ(
  "Full-Stack Digital Marketing", "advanced",
  "When reconciling discrepancies between platform-reported ROAS (e.g., Meta/Google) and actual bank revenue, what scientific approach provides source-of-truth measurement?",
  "Sum all ad network conversions without deduplication", "Run geo-lift incrementality experiments combined with Marketing Mix Modeling (MMM) calibrated against first-party ledger data", "Adopt Last Interaction attribution across all reporting indefinitely", "Rely solely on self-reported 'How did you hear about us' dropdowns", "b"
);
addQ(
  "Full-Stack Digital Marketing", "advanced",
  "In a compounding product-led growth loop (such as Figma or Canva), what dynamic creates self-sustaining organic acquisition?",
  "Buying bulk backlinks from expired domains", "User outputs create public indexable templates or shared collaboration links that attract new searchers who sign up and produce more assets", "Allocating 100% of capital to paid brand search bidding", "Running daily mass cold outreach scripts", "b"
);
addQ(
  "Full-Stack Digital Marketing", "advanced",
  "Scenario: A high-growth SaaS business wants to automate churn prevention. Which full-stack telemetry and activation architecture is industry best practice?",
  "Exporting weekly manual CSVs to an email marketing tool", "Streaming product event telemetry into a data warehouse, scoring churn probability via ML models, and syncing flags via Reverse ETL to CRM workflows", "Removing the cancel button from the user settings page", "Sending generic discount emails to all active users every morning", "b"
);
addQ(
  "Full-Stack Digital Marketing", "advanced",
  "What is the correct mathematical formula for calculating CAC Payback Period for a subscription software business?",
  "CAC / (ARPU * Gross Margin %)", "(CAC * Monthly Churn) / LTV", "Total Revenue / Ad Spend", "ARPU / Gross Margin", "a"
);

// ==============================================================================
// 2. GROWTH MARKETING STRATEGY (20 Questions)
// ==============================================================================
// Beginner (1-7)
addQ(
  "Growth Marketing Strategy", "beginner",
  "What does the acronym 'AARRR' stand for in the popular Pirate Metrics growth framework?",
  "Acquisition, Activation, Retention, Referral, Revenue", "Awareness, Action, Reach, Return, Reinvestment", "Audience, Authority, Ranking, Relevance, ROI", "Account, Allocation, Rate, Resource, Result", "a"
);
addQ(
  "Growth Marketing Strategy", "beginner",
  "What is a company's 'North Star Metric' (NSM)?",
  "The total ad budget spent in Q4", "The single key metric that best captures the core value delivered to customers", "The total count of registered email accounts regardless of activity", "The number of social media followers", "b"
);
addQ(
  "Growth Marketing Strategy", "beginner",
  "What defines Product-Market Fit (PMF)?",
  "When a company launches its first advertising campaign", "When a product successfully satisfies a strong market demand and creates sustainable retention", "When the marketing team reaches 10 full-time employees", "When an app gets approved on the App Store", "b"
);
addQ(
  "Growth Marketing Strategy", "beginner",
  "What is the primary objective of an A/B split test in growth experimentation?",
  "To compare two variants of a marketing asset to identify which produces a statistically superior conversion rate", "To double the budget across two search engines simultaneously", "To test website performance on two different computer monitors", "To divide customer service inquiries between two agents", "a"
);
addQ(
  "Growth Marketing Strategy", "beginner",
  "What is the 'Aha! Moment' in user onboarding?",
  "The moment the user pays their first subscription invoice", "The pivotal moment a user first realizes the core value and benefit of the product", "The moment a user receives a password reset email", "The moment a user clicks on an ad banner", "b"
);
addQ(
  "Growth Marketing Strategy", "beginner",
  "Which metric measures the rate at which existing customers stop subscribing or buying from a business over a given period?",
  "Customer Churn Rate", "Click-Through Rate", "Referral Rate", "Expansion Rate", "a"
);
addQ(
  "Growth Marketing Strategy", "beginner",
  "In growth terminology, what is a 'Growth Loop' compared to a traditional linear marketing funnel?",
  "A closed system where the output of one cycle (e.g., a new user) directly generates the input for the next cycle (e.g., invites new users)", "A continuous monthly Google Ads campaign that never stops spending", "A loop of automated retry attempts for failed credit card transactions", "A circular banner ad design on social media", "a"
);

// Intermediate (8-15)
addQ(
  "Growth Marketing Strategy", "intermediate",
  "What is the 'Sean Ellis PMF Survey Benchmark' for determining if a startup has achieved Product-Market Fit?",
  "At least 40% of surveyed users stating they would be 'very disappointed' if the product disappeared tomorrow", "At least 80% of users opening the weekly newsletter", "A minimum of 10,000 Instagram followers within 30 days", "A 100% positive rating on Trustpilot", "a"
);
addQ(
  "Growth Marketing Strategy", "intermediate",
  "Scenario: A fintech app acquires 20,000 signups per month, but Day 30 retention drops to 4%. Where should the growth team focus immediate experimentation?",
  "Top-of-funnel influencer marketing expansion", "Activation and onboarding experience to shorten Time-to-Value (TTV) and drive early habit formation", "Price increases on paid tiers", "Rebranding the company typography and colors", "b"
);
addQ(
  "Growth Marketing Strategy", "intermediate",
  "What is the definition and formula of Net Revenue Retention (NRR)?",
  "((Starting ARR + Expansion ARR - Contraction ARR - Churn ARR) / Starting ARR) * 100", "(Total Revenue / Total Ad Spend) * 100", "(New ARR / CAC) * 100", "(Gross Profit / Total Users) * 100", "a"
);
addQ(
  "Growth Marketing Strategy", "intermediate",
  "In the ICE prioritization framework for growth experiments, what do the letters I, C, and E stand for?",
  "Impact, Confidence, Ease", "Investment, Cost, Efficiency", "Insight, Campaign, Engagement", "Income, Conversion, Execution", "a"
);
addQ(
  "Growth Marketing Strategy", "intermediate",
  "Scenario: An e-commerce brand wants to increase average order value (AOV). Which growth tactic directly targets this objective without increasing traffic?",
  "Running broad awareness YouTube ads", "Implementing threshold-based free shipping (e.g., 'Spend $75 for Free Shipping') and post-purchase one-click upsells", "Deleting slow-selling SKU pages", "Switching email service providers", "b"
);
addQ(
  "Growth Marketing Strategy", "intermediate",
  "What is a 'K-Factor' (Viral Coefficient) in growth marketing, and what does a value greater than 1.0 signify?",
  "The measure of viral expansion; K > 1.0 indicates self-sustaining exponential viral growth where each user brings in more than one new user", "The cost of acquiring a keyword in search; K > 1.0 means the bid is too high", "The ratio of knowledge-base views to tickets; K > 1.0 indicates poor documentation", "The ratio of desktop to mobile traffic", "a"
);
addQ(
  "Growth Marketing Strategy", "intermediate",
  "When analyzing retention using cohort charts (e.g., triangular retention heatmap), what visual pattern indicates true product retention stability?",
  "The retention curves flatten and become parallel to the x-axis over time", "The retention curve drops to 0% at month 3", "The curve spikes violently every weekend", "All cohort lines cross diagonally", "a"
);
addQ(
  "Growth Marketing Strategy", "intermediate",
  "Scenario: A B2B SaaS startup's sales team is inundated with low-intent free signups. What growth qualification framework separates high-intent buyers?",
  "Product Qualified Leads (PQL) based on specific in-app usage thresholds and feature adoption", "Banning freemium accounts with free email addresses", "Making registration require a phone call", "Increasing pricing by 1000% immediately", "a"
);

// Advanced (16-20)
addQ(
  "Growth Marketing Strategy", "advanced",
  "Scenario: A high-scale marketplace experiences strong demand-side growth but faces a severe supply-side constraint. How should growth strategy pivot?",
  "Double ad spend on the demand side to drive higher prices", "Build supply-side acquisition loops, introduce guaranteed earnings incentives, and streamline vendor onboarding velocity", "Shut down the marketplace temporarily", "Convert the marketplace into a single-vendor retail store", "b"
);
addQ(
  "Growth Marketing Strategy", "advanced",
  "When architecting a quantitative growth model in Google Sheets or Python, what is the core purpose of separating growth into acquisition loops rather than additive channel rows?",
  "To accurately model reinvestment compounding where existing user actions predictably generate downstream user cohorts", "To simplify basic addition for non-technical stakeholders", "To comply with accounting GAAP standards", "To avoid calculating customer acquisition cost", "a"
);
addQ(
  "Growth Marketing Strategy", "advanced",
  "Scenario: A subscription app has an 8-month CAC payback period and 140% Net Revenue Retention. What is the optimal strategic capital allocation decision?",
  "Cut all marketing expenditure to maximize short-term quarterly EBITDA", "Aggressively scale acquisition spend and leverage non-dilutive financing, since unit economics compound profitably", "Pivot the core product to an ad-supported freemium model", "Reduce customer success headcount", "b"
);
addQ(
  "Growth Marketing Strategy", "advanced",
  "How does 'Cohort Degradation' typically manifest as a growth program scales from early adopters to the broader mass market?",
  "Later cohorts exhibit lower baseline retention and lower LTV because mass-market users have broader intent and lower problem-urgency than early evangelists", "Later cohorts always exhibit 10x higher engagement automatically", "Customer acquisition cost drops to zero across all channels", "Viral coefficient increases exponentially without product changes", "a"
);
addQ(
  "Growth Marketing Strategy", "advanced",
  "In high-velocity experimentation teams, what statistical risk occurs when growth marketers stop A/B tests prematurely as soon as p < 0.05 is observed ('peeking problem')?",
  "Inflated Type I error (False Positive) rate, leading to the deployment of ineffective or detrimental changes", "Type II error (False Negative) rate increase only", "Database corruption in Google Analytics", "Automatic server throttling by AWS", "a"
);

// ==============================================================================
// 3. PAID MEDIA & PPC (20 Questions)
// ==============================================================================
// Beginner (1-7)
addQ(
  "Paid Media & PPC", "beginner",
  "In Google Search Ads, what does 'Ad Rank' primarily depend on?",
  "Bid amount and Quality Score (including expected CTR, ad relevance, and landing page experience)", "Only the highest financial bid submitted by the advertiser", "The physical distance between the searcher and Google's data center", "The total number of words in the headline", "a"
);
addQ(
  "Paid Media & PPC", "beginner",
  "What is the primary function of 'Negative Keywords' in a Google Ads search campaign?",
  "To prevent ads from showing for irrelevant search queries and avoid wasted ad spend", "To bid on competitor terms automatically", "To reduce the visual font size of competitor ads", "To translate ads into different languages", "a"
);
addQ(
  "Paid Media & PPC", "beginner",
  "What does 'CPM' stand for in programmatic and social advertising?",
  "Cost Per Million", "Cost Per Mille (Cost Per Thousand Impressions)", "Clicks Per Month", "Conversion Price Multiplier", "b"
);
addQ(
  "Paid Media & PPC", "beginner",
  "Which Google Ads campaign type utilizes automated machine learning to serve ads across Search, YouTube, Display, Discover, Gmail, and Maps from a single campaign?",
  "Performance Max (PMax)", "Standard Shopping Campaign", "Dynamic Search Campaign", "Smart Banner Network", "a"
);
addQ(
  "Paid Media & PPC", "beginner",
  "What is 'ROAS' and how is it calculated?",
  "(Total Revenue from Ads / Total Ad Spend) * 100", "(Total Clicks / Total Impressions) * 100", "Total Profit - Total Ad Spend", "Total Ad Spend / Total Conversions", "a"
);
addQ(
  "Paid Media & PPC", "beginner",
  "In Meta Ads Manager, what is the hierarchy of campaign structure from top to bottom?",
  "Campaign -> Ad Set -> Ad", "Ad Set -> Campaign -> Ad", "Ad -> Ad Group -> Account", "Account -> Creative -> Bidding", "a"
);
addQ(
  "Paid Media & PPC", "beginner",
  "What is a 'Lookalike Audience' (or Similar Audience) in paid social marketing?",
  "An audience of people who share similar demographics and behavioral traits with an existing custom seed audience", "An audience targeting people who follow competitor accounts only", "An audience of duplicate profiles created by bots", "An audience created by scraping public LinkedIn phone numbers", "a"
);

// Intermediate (8-15)
addQ(
  "Paid Media & PPC", "intermediate",
  "In Google Search match types, which syntax denotes a 'Phrase Match' keyword?",
  "\"keyword\"", "[keyword]", "+keyword", "keyword!", "a"
);
addQ(
  "Paid Media & PPC", "intermediate",
  "Scenario: A Meta Ads scaling campaign suddenly sees CPA rise by 85% and frequency reach 7.2 over 7 days. What is the primary diagnosis?",
  "Creative fatigue and audience saturation; refresh creatives and broaden audience targeting", "Facebook Ads server outage", "Competitors hacking the pixel", "Google organic search algorithm update", "a"
);
addQ(
  "Paid Media & PPC", "intermediate",
  "What is the fundamental difference between 'Target CPA' and 'Maximize Conversions' bidding strategies in Google Ads?",
  "Target CPA aims to achieve conversions at or below a specific specified cost; Maximize Conversions spends the full daily budget to capture the highest volume of conversions", "Target CPA only works on YouTube; Maximize Conversions works on Search", "Maximize Conversions guarantees zero ad spend on weekends", "There is no difference in the underlying algorithm", "a"
);
addQ(
  "Paid Media & PPC", "intermediate",
  "Scenario: An e-commerce Google Shopping feed suffers from high impressions on low-margin products and zero spend on bestsellers. How should the PPC specialist restructure the feed?",
  "Use Custom Labels (e.g., Margin Tier / Velocity) to segment products into separate ad groups with differentiated Target ROAS bids", "Delete all low-margin products from the Shopify store", "Increase all product prices by 50%", "Switch all products to broad match text ads", "a"
);
addQ(
  "Paid Media & PPC", "intermediate",
  "What is Meta's 'Advantage+ Shopping Campaign' (ASC) and what distinguishes it from standard conversion campaigns?",
  "An AI-powered end-to-end automated campaign that bundles audience targeting, creative delivery, and placement optimization into a single machine learning model", "A manual bidding tool for buying banner space on Instagram Explore only", "A tool that restricts ads exclusively to desktop users", "A software for negotiating bulk influencer contracts", "a"
);
addQ(
  "Paid Media & PPC", "intermediate",
  "In LinkedIn Ads, why is the Cost Per Click (CPC) significantly higher than Meta Ads, and when is it justified?",
  "LinkedIn possesses verified first-party B2B firmographic data (job title, industry, company size); justified for high-ACV enterprise deals", "LinkedIn charges higher taxes on digital media", "LinkedIn doesn't allow video creatives", "LinkedIn auctions are non-competitive", "a"
);
addQ(
  "Paid Media & PPC", "intermediate",
  "Scenario: A paid media buyer needs to determine if their retargeting campaign is driving incremental revenue or merely claiming credit for organic buyers. What is the best test design?",
  "A randomized PSA / Ghost Ad holdout test or Geo-lift experiment comparing conversion rates of an exposed group vs. unexposed control group", "Pausing Google Analytics for two weeks", "Looking at last-click conversion data in Shopify", "Surveying users via Instagram Stories", "a"
);
addQ(
  "Paid Media & PPC", "intermediate",
  "What role does 'First-Party Customer Match' list upload play in paid search and social campaigns?",
  "Enables precise exclusion of existing customers and builds high-intent value-based lookalike/similar audiences", "Automatically unsubscribes users from competitors' email lists", "Increases Google PageSpeed score for the landing page", "Decreases hosting server costs", "a"
);

// Advanced (16-20)
addQ(
  "Paid Media & PPC", "advanced",
  "Scenario: An omnichannel retail brand spends $500,000/month across Google, Meta, TikTok, and Programmatic Display. How should they structure a Value-Based Bidding (VBB) system?",
  "Feed offline and online conversion values (including gross margin and predicted 90-day LTV) into ad platform APIs via Conversions API and Google Enhanced Conversions", "Set all platforms to Maximize Clicks bidding", "Allocate budget equally across all 4 platforms regardless of return", "Rely entirely on platform-reported in-platform ROAS", "a"
);
addQ(
  "Paid Media & PPC", "advanced",
  "In programmatic media buying via DSPs (Demand-Side Platforms), what is the technical mechanism of 'Header Bidding' compared to the legacy 'Waterfall' model?",
  "Header bidding allows multiple ad exchanges to bid simultaneously on the same publisher inventory in parallel before the ad server is called, maximizing yield and transparency", "Header bidding sequentially queries ad networks one by one based on historical average yields", "Header bidding is a method for styling website navigation bars", "Header bidding eliminates the need for SSPs (Supply-Side Platforms)", "a"
);
addQ(
  "Paid Media & PPC", "advanced",
  "Scenario: Scaling a Meta Ads budget from $5,000/day to $25,000/day causes immediate marginal efficiency collapse. What algorithmic bidding structure mitigates this decay?",
  "Implement a Cost Cap or Bid Cap framework alongside automated scaling rules that dynamically allocate spend only when marginal CPA clears target hurdles", "Switch to Lowest Cost bidding and increase daily budget by 500% in a single edit", "Duplicate the winning ad set 50 times with identical audiences", "Pause all winning creatives to let losing ads run", "a"
);
addQ(
  "Paid Media & PPC", "advanced",
  "How does Google Ads' 'Smart Bidding with Data-Driven Attribution (DDA)' evaluate cross-channel touchpoints compared to position-based models?",
  "DDA analyzes all paths of converting and non-converting users via algorithmic machine learning to assign fractional credit based on how touchpoints statistically alter conversion probability", "DDA gives 40% to the first touch, 40% to the last touch, and 20% divided equally in between", "DDA attributes 100% of revenue to the first search keyword typed", "DDA credits the touchpoint that occurred on mobile only", "a"
);
addQ(
  "Paid Media & PPC", "advanced",
  "When deploying dynamic creative testing (DCT) at scale, what is the 'Hook Rate' (3-second video views / impressions) vs. 'Hold Rate' (100% video views / 3-second views) metric framework used to diagnose?",
  "Hook Rate isolates scroll-stopping visual effectiveness, while Hold Rate evaluates narrative engagement and product messaging resonance", "Hook Rate measures checkout speed, while Hold Rate measures cart abandonment", "Hook Rate measures server uptime, while Hold Rate measures bandwidth", "Hook Rate measures refund requests, while Hold Rate measures chargebacks", "a"
);

// ==============================================================================
// 4. SEO & ORGANIC GROWTH (20 Questions)
// ==============================================================================
// Beginner (1-7)
addQ(
  "SEO & Organic Growth", "beginner",
  "What is the primary function of the HTML `<title>` tag in technical SEO?",
  "Defines the title of the webpage displayed on Search Engine Results Pages (SERPs) and browser tabs", "Defines the background color of the webpage", "Stores secret encryption keys for analytics", "Generates the website's favicon logo", "a"
);
addQ(
  "SEO & Organic Growth", "beginner",
  "What does 'SERP' stand for in search engine marketing?",
  "Search Engine Results Page", "Site Engagement Rating Protocol", "Structured Entity Ranking Program", "Search Efficiency Return Parameter", "a"
);
addQ(
  "SEO & Organic Growth", "beginner",
  "What is a 'Backlink' in organic SEO?",
  "A hyperlink from another website that points to your webpage", "A link on your website that leads to the previous page in user history", "An internal link between two blog posts on the same domain", "A link in a Google Ads text snippet", "a"
);
addQ(
  "SEO & Organic Growth", "beginner",
  "What is the purpose of a website's `robots.txt` file?",
  "To provide search engine crawlers with instructions on which URLs they can or cannot crawl", "To automatically design responsive mobile CSS", "To store user passwords securely", "To send transactional emails to customers", "a"
);
addQ(
  "SEO & Organic Growth", "beginner",
  "Which Google tool provides official search performance data, indexing status, and search query clicks for your website?",
  "Google Search Console", "Google AdSense", "Google Optimize", "Google Workspace", "a"
);
addQ(
  "SEO & Organic Growth", "beginner",
  "What is 'Search Intent' in modern keyword research?",
  "The underlying reason, purpose, or goal a user has when typing a query into a search engine", "The font size of the search box", "The brand name of the search engine being used", "The total monthly search volume of a keyword", "a"
);
addQ(
  "SEO & Organic Growth", "beginner",
  "What does the HTTP status code '301' signify to search engine crawlers?",
  "Permanent redirect of a URL to a new destination", "Page Not Found error", "Temporary redirect for maintenance", "Server timeout error", "a"
);

// Intermediate (8-15)
addQ(
  "SEO & Organic Growth", "intermediate",
  "What is the purpose of the `rel=\"canonical\"` link element?",
  "To tell search engines which URL represents the master / authoritative version of a page to prevent duplicate content issues", "To block search engines from indexing the page entirely", "To accelerate browser JavaScript rendering", "To track affiliate commissions", "a"
);
addQ(
  "SEO & Organic Growth", "intermediate",
  "In Google's Core Web Vitals, which metric measures visual loading stability by quantifying unexpected layout shifts during page render?",
  "Cumulative Layout Shift (CLS)", "Largest Contentful Paint (LCP)", "Interaction to Next Paint (INP)", "First Input Delay (FID)", "a"
);
addQ(
  "SEO & Organic Growth", "intermediate",
  "Scenario: An e-commerce store has 5,000 product variants generating near-identical duplicate URLs via faceted navigation filters. What is the standard technical SEO remediation?",
  "Implement canonical tags pointing to main product categories, configure parameter handling in robots.txt, or use `noindex, follow` on faceted URLs", "Delete all 5,000 products immediately", "Change all product prices to zero", "Write 2,000 words of unique blog content on every facet URL", "a"
);
addQ(
  "SEO & Organic Growth", "intermediate",
  "What is 'Schema Markup' (Structured Data in JSON-LD format) and why is it implemented on a website?",
  "Standardized code that helps search engines understand page context and enables rich snippets (e.g., star reviews, FAQs, recipe details) on SERPs", "A CSS stylesheet that makes the website load in dark mode", "A JavaScript library that blocks web scrapers", "A database query for MySQL databases", "a"
);
addQ(
  "SEO & Organic Growth", "intermediate",
  "What is 'Keyword Cannibalization' in content SEO?",
  "When multiple pages on the same website compete and rank for the exact same target keyword and search intent, diluting organic authority", "When a competitor bids on your branded keywords in Google Ads", "When an author writes an excessively long blog post", "When a search engine deletes an indexed page", "a"
);
addQ(
  "SEO & Organic Growth", "intermediate",
  "Scenario: A company migrates its website domain from `example.com` to `newexample.com`. What is the critical checklist to preserve organic search equity?",
  "Map 1:1 301 redirects for all legacy URLs, update XML sitemaps, submit a Change of Address in Google Search Console, and audit internal links", "Place a banner on the old homepage and do not implement redirects", "Delete the old domain DNS records immediately without redirecting", "Rely on Google to guess where pages moved", "a"
);
addQ(
  "SEO & Organic Growth", "intermediate",
  "What is Google's 'E-E-A-T' quality guideline framework for evaluating content?",
  "Experience, Expertise, Authoritativeness, Trustworthiness", "Engagement, Efficiency, Accuracy, Technology", "Earnings, Equity, Attribution, Targeting", "Exposure, Evolution, Action, Tracking", "a"
);
addQ(
  "SEO & Organic Growth", "intermediate",
  "In technical SEO crawl management, what does 'Crawl Budget' refer to?",
  "The number of pages Googlebot can and wants to crawl on a website within a given timeframe based on server speed and site authority", "The total financial cost of running SEO audit tools", "The monthly budget allocated to buying backlinks", "The advertising spend required to index a page", "a"
);

// Advanced (16-20)
addQ(
  "SEO & Organic Growth", "advanced",
  "Scenario: A massive programmatic directory with 1,000,000 indexable pages experiences index bloat and delayed crawling of high-value pages. How should the SEO architect optimize the crawl pipeline?",
  "Implement strict internal linking architecture, remove thin/low-quality URLs with 410 Gone or noindex, optimize server TTFB under 200ms, and use dynamic XML sitemap partitioning", "Submit all 1,000,000 URLs manually via URL Inspection tool daily", "Add all URLs to robots.txt Disallow", "Remove all internal links to reduce page size", "a"
);
addQ(
  "SEO & Organic Growth", "advanced",
  "In the era of AI Overviews (SGE) and LLM-driven search answers, what optimization strategy ensures content is synthesized into generative search responses (GEO - Generative Engine Optimization)?",
  "Structure content with clear semantic entity relationships, direct answer summaries, authoritative schema citations, and unique first-party data/statistics", "Stuff hidden keyword text in white font at the bottom of the page", "Block all search bots using robots.txt", "Publish only 10-word articles with no formatting", "a"
);
addQ(
  "SEO & Organic Growth", "advanced",
  "Scenario: A single-page application (SPA) built with React experiences indexing failures where Googlebot only indexes blank template shells. What is the fundamental technical fix?",
  "Implement Server-Side Rendering (SSR) or Static Site Generation (SSG) with Next.js/Remix to deliver pre-rendered HTML on the initial HTTP response", "Add more client-side `useEffect` data fetching hooks", "Increase the size of JavaScript bundles", "Switch from HTTPS back to HTTP", "a"
);
addQ(
  "SEO & Organic Growth", "advanced",
  "How does PageRank decay function mathematically across deep internal site architecture, and how is it mitigated?",
  "PageRank attenuates with each link hop through the damping factor (~0.85); mitigated by flattening click depth so high-priority pages are accessible within 3 clicks from root", "PageRank multiplies by 2 for every subfolder level", "PageRank is only determined by the website's domain age", "Internal links pass zero PageRank equity", "a"
);
addQ(
  "SEO & Organic Growth", "advanced",
  "When diagnosing an algorithmic core update penalty (e.g., Google Helpful Content System), why does updating single individual articles rarely recover domain visibility immediately?",
  "Helpful Content and core quality classifiers apply sitewide signals that require purging or overhauling low-value content across the entire domain over multiple validation crawl cycles", "Because Google updates rankings only once every 5 years", "Because Google Search Console freezes account data after updates", "Because backlinks are deleted permanently during core updates", "a"
);

// ==============================================================================
// 5. CRO & CONVERSION OPTIMIZATION (20 Questions)
// ==============================================================================
// Beginner (1-7)
addQ(
  "CRO & Conversion Optimization", "beginner",
  "What is the definition of Conversion Rate (CR) in website optimization?",
  "(Total Number of Conversions / Total Number of Visitors) * 100", "(Total Clicks / Total Ad Spend) * 100", "(Total Revenue / Total Products) * 100", "Total Pageviews - Total Bounces", "a"
);
addQ(
  "CRO & Conversion Optimization", "beginner",
  "What is a 'Call to Action' (CTA)?",
  "A clear prompt (typically a button or link) that encourages the user to take a specific immediate action (e.g., 'Get Started')", "An automated phone call from a sales representative", "An error message indicating page failure", "A copyright disclaimer in the website footer", "a"
);
addQ(
  "CRO & Conversion Optimization", "beginner",
  "In landing page design, what does the term 'Above the Fold' mean?",
  "The portion of a webpage that is visible to the user without scrolling down", "The bottom footer containing privacy policies", "The hidden source code in the HTML `<head>`", "The printed brochure version of a website", "a"
);
addQ(
  "CRO & Conversion Optimization", "beginner",
  "What is 'Social Proof' on a conversion landing page?",
  "Evidence that other people have purchased or approved of a product (e.g., customer reviews, testimonials, trust badges)", "A list of links to the company's social media profiles", "A screenshot of an Instagram post with 100 likes", "A legal privacy policy document", "a"
);
addQ(
  "CRO & Conversion Optimization", "beginner",
  "What does a 'Heatmap' tool (such as Hotjar or Microsoft Clarity) visualize?",
  "Visual representations of where users click, move their cursor, and scroll on a webpage", "The physical temperature of the web hosting server", "The geographic weather of website visitors", "The speed of internet connections across different cities", "a"
);
addQ(
  "CRO & Conversion Optimization", "beginner",
  "What is 'Form Friction' and how does it affect conversion rates?",
  "Excessive required form fields, confusing input validations, or unclear labels that increase cognitive load and cause user abandonment", "A technical bug that prevents credit cards from being typed", "The speed at which a submit button animates", "The color contrast ratio of form placeholder text", "a"
);
addQ(
  "CRO & Conversion Optimization", "beginner",
  "What is the difference between an A/B test and an A/B/n test?",
  "An A/B test compares one variation against the control; an A/B/n test compares multiple variations (e.g., B, C, D) against the control simultaneously", "An A/B test is for mobile only; A/B/n is for desktop only", "An A/B test requires no analytics tracking", "There is no functional difference", "a"
);

// Intermediate (8-15)
addQ(
  "CRO & Conversion Optimization", "intermediate",
  "In statistical A/B testing, what does a 'Statistical Significance' level of 95% (p < 0.05) mean?",
  "There is a 95% probability that the observed difference in conversion rate is not due to random chance", "The conversion rate will permanently increase by 95%", "95% of website visitors prefer the new variation", "The test ran for 95 consecutive days", "a"
);
addQ(
  "CRO & Conversion Optimization", "intermediate",
  "What is the 'LIFT Model' developed by WiderFunnel for analyzing conversion barriers?",
  "A framework analyzing Value Proposition against 5 conversion factors: Relevance, Clarity, Urgency, Anxiety, and Distraction", "A tool for lifting search engine keyword rankings", "An algorithm for calculating delivery shipping fees", "A methodology for increasing server CPU performance", "a"
);
addQ(
  "CRO & Conversion Optimization", "intermediate",
  "Scenario: A B2B demo request landing page has a high bounce rate. The current form requires 12 input fields including company revenue and physical fax number. What is the highest-impact CRO hypothesis?",
  "Reducing form fields to essential fields (Name, Work Email, Company Size) or splitting into a progressive multi-step form will significantly decrease cognitive friction and increase completion rates", "Adding 5 more mandatory dropdown fields to qualify leads further", "Changing the background color to flashing bright neon red", "Removing all text from the landing page", "a"
);
addQ(
  "CRO & Conversion Optimization", "intermediate",
  "What is 'Sample Size Calculation' (Power Analysis) and why must it be performed BEFORE launching an A/B test?",
  "To determine the minimum number of visitors per variant required to reliably detect a Minimum Detectable Effect (MDE) without false positives", "To calculate the monthly hosting bill for the test", "To choose the font size of the primary headline", "To limit the maximum number of paying customers", "a"
);
addQ(
  "CRO & Conversion Optimization", "intermediate",
  "What is the difference between qualitative and quantitative research in CRO?",
  "Quantitative tells you WHAT users are doing (analytics numbers, funnel drop-offs); qualitative tells you WHY users are doing it (user recordings, surveys, interviews)", "Quantitative is only for e-commerce, while qualitative is for blogs", "Qualitative uses numbers, while quantitative uses feelings", "Quantitative research does not require data collection", "a"
);
addQ(
  "CRO & Conversion Optimization", "intermediate",
  "Scenario: An e-commerce brand wants to reduce cart abandonment on mobile. Testing revealed users struggle to type credit card numbers on small screens. What is the best UX/CRO solution?",
  "Implement one-click mobile express checkouts (Apple Pay, Google Pay, Shop Pay)", "Disable mobile checkout completely and force users to use desktop computers", "Require users to type their credit card number twice for security", "Increase checkout shipping fees", "a"
);
addQ(
  "CRO & Conversion Optimization", "intermediate",
  "What is 'Cognitive Load' in UX design and how does it influence conversion rates?",
  "The total amount of mental effort and working memory required for a user to understand and navigate an interface; high cognitive load suppresses conversions", "The download size of the website's CSS file", "The processing power of the user's smartphone processor", "The emotional sentiment of customer support agents", "a"
);
addQ(
  "CRO & Conversion Optimization", "intermediate",
  "In multivariate testing (MVT), what is being tested compared to standard A/B testing?",
  "Multiple elements on a page (e.g., headline, CTA button, hero image) tested in all possible combinations simultaneously to measure individual and interaction effects", "Testing the website across multiple operating systems only", "Testing website load speed under high traffic loads", "Testing email deliverability across multiple SMTP servers", "a"
);

// Advanced (16-20)
addQ(
  "CRO & Conversion Optimization", "advanced",
  "Scenario: A high-traffic subscription website runs an A/B test with 50,000 conversions. The test variant shows a +4% lift (p = 0.01), but after sitewide rollout, monthly revenue is unchanged. What statistical phenomenon occurred?",
  "Selection bias / Novelty effect / Twyman's Law, or failure to account for seasonal regression to the mean and long-term cohort retention", "The database ran out of disk space", "Google Ads stopped bidding on mobile", "A 4% lift is mathematically impossible to measure", "a"
);
addQ(
  "CRO & Conversion Optimization", "advanced",
  "What is the mathematical difference between Frequentist and Bayesian statistical methodologies in A/B testing platforms?",
  "Frequentist relies on fixed sample sizes, p-values, and null-hypothesis testing; Bayesian computes the direct posterior probability of variant B being better than variant A and expected loss", "Frequentist testing never reaches statistical significance", "Bayesian testing only works on websites with fewer than 100 visitors", "Frequentist testing requires no historical data", "a"
);
addQ(
  "CRO & Conversion Optimization", "advanced",
  "Scenario: An experimentation leader wants to eliminate 'Flicker Effect' (Flash of Unstyled Content) in client-side A/B testing tools. What architectural design is mandatory?",
  "Execute experiments Server-Side (Edge Workers / Cloudflare Workers / Next.js Middleware) or use synchronous anti-flicker snippets with SSR integration", "Add a 5-second `setTimeout` delay in JavaScript before rendering", "Make the entire webpage background black", "Disable CSS stylesheets on all pages", "a"
);
addQ(
  "CRO & Conversion Optimization", "advanced",
  "In behavioral economics applied to CRO, what is 'Loss Aversion' (Kahneman & Tversky) and how is it ethically operationalized in high-converting SaaS pricing tables?",
  "The psychological principle that losses are felt ~2x more intensely than equivalent gains; operationalized by framing product benefits around avoiding wasted money or lost productivity", "Artificially charging customer credit cards twice", "Hiding the price until the customer enters credit card details", "Showing a countdown timer that resets to 10 minutes every time the page refreshes", "a"
);
addQ(
  "CRO & Conversion Optimization", "advanced",
  "When running multi-armed bandit (MAB) algorithms (e.g., Thompson Sampling) instead of fixed-horizon A/B tests, what is the primary business trade-off?",
  "Bandits maximize conversions during the experiment by dynamically shifting traffic to the winning variant (minimizing regret), but reduce statistical power for causal learning and secondary metric auditing", "Bandits guarantee that no visitor ever sees a losing variant", "Bandits eliminate the need for conversion tracking tags", "Bandits require zero web traffic to find winners", "a"
);

// ==============================================================================
// 6. EMAIL & LIFECYCLE AUTOMATION (20 Questions)
// ==============================================================================
// Beginner (1-7)
addQ(
  "Email & Lifecycle Automation", "beginner",
  "What does 'Open Rate' measure in email marketing campaigns?",
  "The percentage of delivered emails that were opened by recipients", "The percentage of recipients who clicked a link inside the email", "The percentage of emails that failed to deliver", "The percentage of recipients who marked the email as spam", "a"
);
addQ(
  "Email & Lifecycle Automation", "beginner",
  "What is a 'Welcome Sequence' (Welcome Flow) in email lifecycle automation?",
  "An automated series of onboarding emails sent immediately after a new subscriber or customer signs up", "A manual monthly promotional newsletter sent to all contacts", "An email sent when a customer requests an account cancellation", "An internal notification email sent to the CEO", "a"
);
addQ(
  "Email & Lifecycle Automation", "beginner",
  "What does 'ESP' stand for in digital marketing infrastructure?",
  "Email Service Provider (e.g., Klaviyo, Mailchimp, Customer.io)", "Electronic Sales Protocol", "Enterprise Search Platform", "Estimated Social Performance", "a"
);
addQ(
  "Email & Lifecycle Automation", "beginner",
  "What is the difference between a 'Hard Bounce' and a 'Soft Bounce' in email deliverability?",
  "A hard bounce is a permanent delivery failure (e.g., invalid email address); a soft bounce is a temporary delivery failure (e.g., full mailbox or server down)", "A hard bounce means the recipient deleted the email; a soft bounce means they opened it", "A hard bounce only happens on Gmail; a soft bounce happens on Yahoo", "There is no technical difference between the two", "a"
);
addQ(
  "Email & Lifecycle Automation", "beginner",
  "Under international privacy regulations (CAN-SPAM, GDPR), what must every marketing email include?",
  "A clear and conspicuous unsubscribe link and a valid physical postal address of the sender", "A link to the CEO's personal Facebook profile", "A coupon code for at least 20% off", "A disclaimer written in Latin", "a"
);
addQ(
  "Email & Lifecycle Automation", "beginner",
  "What is an 'Abandoned Cart' email flow in e-commerce automation?",
  "An automated email sent to shoppers who added items to their shopping cart but left the website before completing purchase", "An email sent to customers 1 year after their last purchase", "An email notifying the warehouse that inventory is out of stock", "A receipt sent after successful payment", "a"
);
addQ(
  "Email & Lifecycle Automation", "beginner",
  "What is the 'Preview Text' (Preheader Text) of an email?",
  "The snippet of text that appears next to or beneath the subject line in an email client's inbox view", "The HTML code inside the email header", "The image alt text on the company logo", "The email address of the sending server", "a"
);

// Intermediate (8-15)
addQ(
  "Email & Lifecycle Automation", "intermediate",
  "What are the three essential DNS authentication records required to maximize email inbox deliverability and prevent spoofing?",
  "SPF (Sender Policy Framework), DKIM (DomainKeys Identified Mail), and DMARC (Domain-based Message Authentication)", "SSL, TLS, and HTTPS", "CNAME, TXT, and PTR records only", "HTML5, CSS3, and JavaScript", "a"
);
addQ(
  "Email & Lifecycle Automation", "intermediate",
  "Scenario: An e-commerce brand's email open rates suddenly plummet from 42% to 11% across Gmail accounts. What is the root cause and immediate corrective action?",
  "Sender domain reputation damaged due to high spam complaints or unengaged list emailing; implement list hygiene to target only 30-day engaged users and audit DMARC/DKIM records", "Send 5 emails per day to the entire unengaged list to force opens", "Buy a new list of 100,000 email addresses to replace the old list", "Delete all images from future email templates", "a"
);
addQ(
  "Email & Lifecycle Automation", "intermediate",
  "How did Apple's Mail Privacy Protection (MPP / iOS 15) impact email marketing metrics?",
  "Apple pre-fetches and opens email images on proxy servers, artificially inflating open rates and obscuring recipient IP/location data", "Apple blocked all marketing emails from reaching the inbox", "Apple converted all email HTML into plain text files", "Apple prohibited the use of emoji in subject lines", "a"
);
addQ(
  "Email & Lifecycle Automation", "intermediate",
  "What is 'List Segmentation' and why does segmented emailing outperform blast campaigns?",
  "Dividing an email database into targeted groups based on behavioral attributes, purchase history, and engagement to deliver hyper-relevant content", "Exporting email lists into separate Microsoft Excel spreadsheets", "Randomly dividing subscribers into two equal groups", "Sending emails at 2:00 AM instead of 2:00 PM", "a"
);
addQ(
  "Email & Lifecycle Automation", "intermediate",
  "Scenario: A SaaS company wants to design a 'Win-Back / Re-engagement' flow for dormant users who haven't logged in for 60 days. What structure is most effective?",
  "A multi-stage sequence offering compelling product updates, a reminder of unextracted value, an exclusive incentive, followed by an automated permission reminder / sunset policy", "Sending 10 consecutive emails asking 'Why did you leave us?'", "Calling the user on the phone every hour", "Deleting the user's account immediately with no notice", "a"
);
addQ(
  "Email & Lifecycle Automation", "intermediate",
  "In lifecycle automation, what is the role of a 'Sunset Policy' for inactive subscribers?",
  "Automatically unsubscribing or suppressing contacts who have not opened or clicked an email in 90-180 days to protect sender reputation and deliverability", "Sending evening newsletters at sunset based on the user's timezone", "Offering 50% discounts on summer merchandise", "Changing the email template color theme to dark orange", "a"
);
addQ(
  "Email & Lifecycle Automation", "intermediate",
  "What is dynamic personalization in modern email marketing (e.g., Liquid templating)?",
  "Using merge tags and conditional code logic to display custom product recommendations, names, and localized content unique to each recipient", "Manually typing every subscriber's name in individual emails", "Changing the sender name to match the recipient's city", "Attaching a PDF file to every outbound newsletter", "a"
);
addQ(
  "Email & Lifecycle Automation", "intermediate",
  "What is 'IP Warming' and when is it necessary for enterprise email senders?",
  "Gradually increasing email send volume over weeks on a new dedicated IP address to build a positive reputation with Internet Service Providers (ISPs)", "Heating server hardware to maintain optimal temperature in data centers", "Sending emails only to warm countries during winter", "Running ping tests against Google DNS servers", "a"
);

// Advanced (16-20)
addQ(
  "Email & Lifecycle Automation", "advanced",
  "Scenario: An enterprise marketplace wants to orchestrate real-time behavioral messaging across Email, SMS, Push Notifications, and In-App Modals based on live event streams. What architecture is required?",
  "A real-time Customer Engagement Platform (e.g., Braze, Iterable) connected via WebSocket / Kafka event pipelines with centralized channel-frequency capping and unified user state", "Setting up 4 independent Zapier webhooks with 15-minute polling delays", "Sending an automated SMS every time an email is opened", "Writing custom cron jobs in PHP on a shared hosting server", "a"
);
addQ(
  "Email & Lifecycle Automation", "advanced",
  "What is the technical purpose of BIMI (Brand Indicators for Message Identification) and what are its strict prerequisites?",
  "Displays the brand's verified logo next to emails in supported inboxes; requires DMARC policy set to `p=reject` or `p=quarantine` at 100% and a Verified Mark Certificate (VMC)", "BIMI is a compression algorithm for email attachments", "BIMI translates emails into 40 languages automatically", "BIMI encrypts credit card transactions inside email bodies", "a"
);
addQ(
  "Email & Lifecycle Automation", "advanced",
  "Scenario: A direct-to-consumer brand wants to optimize customer repurchase cycles using predictive machine learning. How is this built into lifecycle flows?",
  "Compute Predicted Next Order Date (PNOD) and Replenishment Curves in a data model, triggering dynamic replenishment flows 5-7 days before each individual customer's predicted depletion window", "Send a daily blast email offering 10% off everything", "Wait until the customer unsubscribes before sending a coupon", "Rely on customers to set calendar reminders on their phones", "a"
);
addQ(
  "Email & Lifecycle Automation", "advanced",
  "How should lifecycle marketers design an automated Lead Scoring model in marketing automation (e.g., HubSpot / Marketo)?",
  "Combine explicit demographic fit (title, company size, revenue) with implicit behavioral signals (pricing page visits, webinar attendance, recency, and frequency) to trigger sales handoffs", "Assign 100 points to anyone who visits the homepage once", "Score leads solely on the length of their company name", "Deduct points whenever a prospect downloads a whitepaper", "a"
);
addQ(
  "Email & Lifecycle Automation", "advanced",
  "In high-volume transactional email infrastructure (e.g., SendGrid, Postmark, Amazon SES), why is separating transactional IPs from promotional marketing IPs mandatory?",
  "To protect mission-critical transactional emails (password resets, order confirmations) from being blocked or delayed if marketing campaigns trigger spam complaints", "Because transactional emails are not allowed to use HTML code", "To comply with credit card PCI-DSS rules", "Because promotional emails must be sent from port 80 only", "a"
);

// ==============================================================================
// 7. ANALYTICS & ATTRIBUTION (20 Questions)
// ==============================================================================
// Beginner (1-7)
addQ(
  "Analytics & Attribution", "beginner",
  "In Google Analytics 4 (GA4), what is the foundational measurement model based on?",
  "Events and Parameters (replacing the Universal Analytics session/pageview model)", "Hits and Pageviews only", "Keywords and Ad Groups", "User IP addresses and MAC addresses", "a"
);
addQ(
  "Analytics & Attribution", "beginner",
  "What is a 'Metric' versus a 'Dimension' in web analytics reporting?",
  "A dimension is a descriptive qualitative attribute (e.g., Country, Device); a metric is a quantitative numerical measurement (e.g., Users, Sessions, Revenue)", "A metric is a chart; a dimension is a table", "A dimension is financial; a metric is geographic", "There is no difference between dimensions and metrics", "a"
);
addQ(
  "Analytics & Attribution", "beginner",
  "What does 'Attribution' mean in digital marketing?",
  "The methodology of assigning credit and financial value to different marketing touchpoints along the customer's journey to conversion", "The legal copyright notice on a website footer", "The process of registering a trademark with government authorities", "The code comments written inside JavaScript files", "a"
);
addQ(
  "Analytics & Attribution", "beginner",
  "Which single-touch attribution model assigns 100% of conversion credit to the very last channel the user clicked before buying?",
  "Last Click Attribution", "First Click Attribution", "Linear Attribution", "Time Decay Attribution", "a"
);
addQ(
  "Analytics & Attribution", "beginner",
  "What is 'Engaged Session' in GA4 defined as?",
  "A session that lasted longer than 10 seconds, had a conversion event, or had at least 2 pageviews", "Any session where the user clicked on a video", "A session where the user typed in the search bar", "Any visit from a desktop computer", "a"
);
addQ(
  "Analytics & Attribution", "beginner",
  "Which tool allows marketers to build custom, interactive business intelligence dashboards connected directly to GA4, Google Sheets, and SQL databases?",
  "Looker Studio (formerly Google Data Studio)", "Google Fonts", "Google Keep", "Google Forms", "a"
);
addQ(
  "Analytics & Attribution", "beginner",
  "What is a 'Funnel Visualization' used for in web analytics?",
  "To track step-by-step user progression through a multi-step sequence (e.g., Checkout) and pinpoint where users drop off", "To visualize the geographic location of web servers", "To measure page load speed across different browsers", "To compare font sizes across different pages", "a"
);

// Intermediate (8-15)
addQ(
  "Analytics & Attribution", "intermediate",
  "What is the structural flaw of the traditional 'Last-Click' attribution model in multi-channel marketing?",
  "It overvalues bottom-of-funnel capture channels (branded search, direct) while completely ignoring top-of-funnel discovery channels (paid social, content, display)", "It fails to record any transaction revenue", "It is illegal under GDPR regulations", "It only tracks traffic from Apple Safari browsers", "a"
);
addQ(
  "Analytics & Attribution", "intermediate",
  "How does Google Analytics 4 (GA4) handle cross-device user tracking using 'User-ID'?",
  "By associating authenticated persistent user IDs passed from login databases to unify sessions across mobile, desktop, and web into a single user journey", "By tracking the hardware MAC address of the user's laptop", "By storing tracking cookies in the browser's BIOS", "By requiring users to scan a QR code on every page", "a"
);
addQ(
  "Analytics & Attribution", "intermediate",
  "Scenario: A marketing director notices that GA4 reports 1,200 purchases, while Shopify backend reports 1,450 orders. What are the common technical reasons for this discrepancy?",
  "Ad blockers, user opt-outs / cookie consent rejections, payment gateway redirect drop-offs before the thank-you page scripts fire, and Apple ITP limitations", "Shopify counts non-existent orders created by artificial intelligence", "GA4 charges per purchase recorded", "Shopify server time is 24 hours ahead of Google", "a"
);
addQ(
  "Analytics & Attribution", "intermediate",
  "What is 'MER' (Marketing Efficiency Ratio or Blended ROAS) and how is it calculated?",
  "Total Top-Line Business Revenue / Total Marketing Ad Spend across all channels combined", "(Meta Revenue / Meta Spend) * 100", "(Total Email Clicks / Total Website Visits) * 100", "Total Profit - Total Taxes", "a"
);
addQ(
  "Analytics & Attribution", "intermediate",
  "In SQL data analysis, which statement is used to combine rows from two tables based on a related common key column (e.g., `user_id`)?",
  "JOIN (e.g., INNER JOIN / LEFT JOIN)", "GROUP BY", "ORDER BY", "DROP TABLE", "a"
);
addQ(
  "Analytics & Attribution", "intermediate",
  "Scenario: A B2B growth marketer needs to track when users scroll 90% of a long-form article. How is this implemented in Google Tag Manager?",
  "Create a Scroll Depth Trigger set to Vertical Scroll Percentage 90%, and attach a GA4 Event Tag passing event name `scroll_90`", "Write 50 lines of custom PHP in the header", "Require users to click a button at the bottom of the article", "Install a separate analytics plugin for every blog post", "a"
);
addQ(
  "Analytics & Attribution", "intermediate",
  "What is 'Cohort Analysis' in digital product analytics (e.g., Mixpanel / Amplitude)?",
  "Tracking the behavioral patterns and retention metrics of a group of users who share a common characteristic or acquisition timeframe over time", "Analyzing the demographic age distribution of website visitors once a year", "Measuring the server CPU load during holiday traffic spikes", "Comparing the font styles used by competitors", "a"
);
addQ(
  "Analytics & Attribution", "intermediate",
  "What is 'Data Thresholding' in Google Analytics 4 reports?",
  "System suppression of reporting rows with small user numbers when Google Signals is enabled to prevent individual user identity deduction", "An error when the website exceeds 10,000 monthly visitors", "A tool for speeding up SQL query execution", "A mechanism that deletes historical data older than 30 days", "a"
);

// Advanced (16-20)
addQ(
  "Analytics & Attribution", "advanced",
  "Scenario: An enterprise D2C conglomerate with $50M annual ad spend wants to measure cross-channel media contribution without reliance on third-party cookies or user tracking. What econometric methodology is required?",
  "Marketing Mix Modeling (MMM) using Bayesian regression (e.g., Meta Robyn / Google Meridian) incorporating adstock transformation, saturation curves, and baseline macroeconomic covariates", "Switching all ad campaigns to Last Non-Direct Click attribution in GA4", "Relying exclusively on in-platform Facebook Ads ROAS dashboards", "Surveying every 10th customer on the checkout confirmation screen", "a"
);
addQ(
  "Analytics & Attribution", "advanced",
  "In multi-touch attribution (MTA), what is the mathematical formulation of 'Shapley Value' attribution derived from cooperative game theory?",
  "Calculates the marginal contribution of each marketing channel across all possible coalition permutations of touchpoint combinations in the customer journey", "Assigns equal 1/N credit to every channel regardless of position", "Decays credit exponentially based on time elapsed since the first touch", "Credits 100% of revenue to whichever channel spent the most budget", "a"
);
addQ(
  "Analytics & Attribution", "advanced",
  "Scenario: An analytics engineering team is building an automated data pipeline from GA4 BigQuery raw export tables. Why is querying the daily raw event tables (`events_YYYYMMDD`) superior to the standard GA4 UI?",
  "Bypasses UI sampling and cardinality limits, allows custom sessionization logic, enables joined attribution modeling with backend CRM/finance databases, and provides unaggregated user-level event logs", "BigQuery automatically optimizes ad bids in Google Ads in real-time", "BigQuery is completely free regardless of data volume", "BigQuery generates display ad banners automatically", "a"
);
addQ(
  "Analytics & Attribution", "advanced",
  "What is 'Adstock Theory' (Carryover Effect and Lagged Impact) in advertising econometrics?",
  "The mathematical modeling of how advertising awareness decays over time and accumulates with repeated exposure, parameterized by half-life decay rates", "The total number of ad creatives stored in a design repository", "The inventory of unsold banner impressions on an ad network", "The physical stock of retail products kept in warehouse storage", "a"
);
addQ(
  "Analytics & Attribution", "advanced",
  "How is a scientifically rigorous 'Matched-Market Geo-Lift Experiment' executed to measure the true incremental lift of a digital advertising channel?",
  "Partition geographic regions into randomized treatment and control markets with similar baseline pre-test correlation; apply ad spend in treatment markets and compute synthetic counterfactual difference-in-differences", "Run ads nationwide for 1 week and pause them for the next week", "Show ads to users living on odd-numbered street addresses only", "Compare this year's Christmas revenue to last year's Christmas revenue", "a"
);

// ==============================================================================
// 8. GENERAL DIGITAL MARKETING (20 Questions)
// ==============================================================================
// Beginner (1-7)
addQ(
  "General Digital Marketing", "beginner",
  "What does 'B2B' and 'B2C' stand for in business marketing?",
  "Business-to-Business and Business-to-Consumer", "Brand-to-Brand and Brand-to-Customer", "Buyer-to-Buyer and Buyer-to-Client", "Benchmark-to-Business and Benchmark-to-Company", "a"
);
addQ(
  "General Digital Marketing", "beginner",
  "What is a 'Buyer Persona' in marketing strategy?",
  "A semi-fictional representation of an ideal customer based on market research and real customer data", "The actual legal signature of a customer on a sales contract", "An actor hired to speak in a video commercial", "A generic list of 100 random email addresses", "a"
);
addQ(
  "General Digital Marketing", "beginner",
  "What is 'Content Marketing'?",
  "A strategic marketing approach focused on creating and distributing valuable, relevant, and consistent content to attract and retain a clearly defined audience", "Buying billboard advertisements along major highways", "Sending unsolicited direct mail brochures to physical residential addresses", "Cold calling residential phone numbers during dinner hours", "a"
);
addQ(
  "General Digital Marketing", "beginner",
  "Which social media platform is primarily tailored for professional networking, B2B marketing, and corporate recruiting?",
  "LinkedIn", "Snapchat", "Pinterest", "Twitch", "a"
);
addQ(
  "General Digital Marketing", "beginner",
  "What does 'KPI' stand for in performance management?",
  "Key Performance Indicator", "Keyword Placement Index", "Knowledge Production Insight", "Key Promotion Initiative", "a"
);
addQ(
  "General Digital Marketing", "beginner",
  "What is 'Influencer Marketing'?",
  "Collaborating with individuals who have an established social following and niche credibility to endorse products or services", "Hiring telemarketers to call local businesses", "Running newspaper classified ads", "Submitting press releases to print magazines", "a"
);
addQ(
  "General Digital Marketing", "beginner",
  "What is 'Affiliate Marketing'?",
  "A performance-based marketing model where a business rewards third-party publishers (affiliates) with a commission for every sale generated through their referral links", "A marketing model where a company buys shares in its competitors", "A program where employees are required to post on social media", "An agreement between two banks to share customer data", "a"
);

// Intermediate (8-15)
addQ(
  "General Digital Marketing", "intermediate",
  "What is the difference between 'Inbound Marketing' and 'Outbound Marketing'?",
  "Inbound attracts customers by creating helpful content and experiences tailored to them; Outbound pushes promotional messages out to people regardless of interest (cold calls, TV ads, direct mail)", "Inbound is only for e-commerce; Outbound is only for brick-and-mortar stores", "Inbound requires no budget; Outbound is free", "There is no strategic difference between the two", "a"
);
addQ(
  "General Digital Marketing", "intermediate",
  "What is a 'Unique Selling Proposition' (USP)?",
  "The distinct feature, benefit, or competitive advantage that sets a company's product apart from all alternatives in the market", "The legal patent registration number of a product", "The barcode printed on physical product packaging", "The standard retail price of an item", "a"
);
addQ(
  "General Digital Marketing", "intermediate",
  "Scenario: A brand's product launch campaign suffers from fragmented messaging across PR, social ads, email, and organic social. What strategic framework unites these efforts?",
  "Integrated Marketing Communications (IMC) aligning core brand narrative, creative assets, and audience segmentation across all digital and physical channels", "Canceling all marketing channels except Facebook", "Letting each department write completely different messaging with no central guidelines", "Hiring 10 separate freelance copywriters with no creative brief", "a"
);
addQ(
  "General Digital Marketing", "intermediate",
  "What is 'Brand Equity' and why does high brand equity lower customer acquisition costs over time?",
  "The commercial value and premium perception derived from consumer recognition and trust, driving higher organic search volume, referral word-of-mouth, and conversion rates", "The total financial balance in the company's checking account", "The physical real estate value of corporate office buildings", "The total count of trademark filings owned by the firm", "a"
);
addQ(
  "General Digital Marketing", "intermediate",
  "In marketing research, what is the 'Net Promoter Score' (NPS) question and scoring scale?",
  "'On a scale of 0-10, how likely are you to recommend us to a friend or colleague?'; Promoters (9-10), Passives (7-8), Detractors (0-6)", "'Do you like our brand? Yes or No'", "'How many times per day do you visit our website?' (1-100)", "'Rate our customer service from 1 to 5 stars'", "a"
);
addQ(
  "General Digital Marketing", "intermediate",
  "Scenario: A startup has a total Addressable Market (TAM) of $10B, Serviceable Addressable Market (SAM) of $1B, and Serviceable Obtainable Market (SOM) of $50M. What does SOM represent in their go-to-market plan?",
  "The realistic portion of the market the company can capture in the near term given current resources, competition, and distribution capabilities", "The total revenue of all competitors in the entire global economy", "The budget required to buy Google Ads for 10 years", "The maximum amount of venture capital funding the startup can raise", "a"
);
addQ(
  "General Digital Marketing", "intermediate",
  "What is 'Account-Based Marketing' (ABM) in B2B enterprise strategy?",
  "A focused growth strategy where marketing and sales collaborate to target specific high-value enterprise accounts as individual markets", "A process where accountants manage company social media profiles", "A method for automatically opening multiple bank accounts for ad spend", "A software tool for sending mass generic cold emails to 1,000,000 domains", "a"
);
addQ(
  "General Digital Marketing", "intermediate",
  "What is 'Content Repurposing' and how does it maximize content ROI?",
  "Taking a core high-value content asset (e.g., a 45-minute webinar) and transforming it into multiple formats (blog articles, YouTube shorts, LinkedIn carousels, podcasts, infographics)", "Copying and pasting competitor blog posts word-for-word", "Deleting old blog posts and republishing them with new dates", "Translating website text into binary code", "a"
);

// Advanced (16-20)
addQ(
  "General Digital Marketing", "advanced",
  "Scenario: An enterprise CMO needs to position a challenger brand against a dominant category leader. According to positioning theory (Ries & Trout / April Dunford), what is the most defensible market entry strategy?",
  "Sub-segment the market into a specialized, underserved niche where your unique differentiation is indispensable, establishing category ownership before expanding adjacencies", "Attempt to outspend the market leader head-to-head on identical generic keywords", "Copy the market leader's exact website copy, logo, and pricing tiers", "Drop all product prices below marginal cost indefinitely", "a"
);
addQ(
  "General Digital Marketing", "advanced",
  "In modern international marketing compliance, how do GDPR, CCPA/CPRA, and global data privacy frameworks fundamentally restrict digital marketing operations?",
  "Mandate explicit opt-in consent for tracking cookies, grant users rights to access/delete personal data, prohibit unauthorized cross-context behavioral tracking, and enforce severe global turnover penalties", "Prohibit businesses from running paid advertisements on social media", "Require all digital marketing copy to be written in both English and French", "Limit website domain registrations to 1 year maximum", "a"
);
addQ(
  "General Digital Marketing", "advanced",
  "Scenario: A legacy direct-to-consumer brand faces severe margin pressure due to rising digital ad inflation across Meta and Google. How should the executive team restructure the Go-To-Market (GTM) engine?",
  "Diversify into wholesale retail distribution, build owned media/community flywheels, expand high-margin subscription bundles, and invest in brand storytelling to drive non-paid direct traffic", "Increase paid ad spend by 400% on the same saturated ad sets", "Shut down customer service to save operational expenses", "Stop fulfilling customer orders to preserve inventory", "a"
);
addQ(
  "General Digital Marketing", "advanced",
  "What is 'The Long Tail' economic concept (Chris Anderson) as applied to modern e-commerce and search inventory?",
  "The collective market demand for thousands of niche, low-volume products or long-tail search keywords cumulatively exceeds the revenue potential of a small number of mainstream bestsellers", "The physical length of a website landing page when viewed on mobile screens", "The delay between when an ad is clicked and when a payment clears", "The number of characters allowed in a Google Ads headline", "a"
);
addQ(
  "General Digital Marketing", "advanced",
  "When architecting a crisis communications and brand reputation recovery framework following a severe PR incident, what is the critical digital response protocol?",
  "Immediately pause all scheduled promotional social ads and automated marketing emails, issue a transparent and accountable executive statement on owned channels, and monitor real-time social sentiment data", "Delete all company social media accounts and refuse all comment", "Post humorous promotional memes on Instagram to distract users", "Blame customers publicly on the corporate blog", "a"
);

// ==============================================================================
// 9. AI & AUTOMATION STRATEGY (20 Questions)
// ==============================================================================
// Beginner (1-7)
addQ(
  "AI & Automation Strategy", "beginner",
  "What is a 'Large Language Model' (LLM) such as GPT-4 or Gemini?",
  "An advanced deep learning artificial intelligence model trained on vast text datasets to understand, synthesize, and generate human-like language", "A database software designed solely for storing customer credit card numbers", "A physical hardware server located in a corporate data center", "A computer monitor calibration tool for graphic designers", "a"
);
addQ(
  "AI & Automation Strategy", "beginner",
  "What is 'Prompt Engineering' in generative AI marketing workflows?",
  "The practice of structuring, refining, and optimizing text inputs to guide AI models into producing accurate, high-quality, and contextually aligned outputs", "Writing backend code in C++ for computer graphics cards", "Repairing physical hardware servers in data centers", "Configuring email DNS SPF records", "a"
);
addQ(
  "AI & Automation Strategy", "beginner",
  "What is an 'AI Chatbot' on a customer-facing website?",
  "An automated conversational interface powered by natural language processing to answer customer inquiries, qualify leads, and resolve support tickets 24/7", "A pop-up banner advertising seasonal discounts", "A video recording of a sales representative", "A website search bar that redirects to Google", "a"
);
addQ(
  "AI & Automation Strategy", "beginner",
  "Which no-code workflow automation platforms connect disparate web applications via APIs to automate repetitive marketing tasks without writing code?",
  "Zapier and Make (formerly Integromat)", "Photoshop and Illustrator", "WordPress and Drupal", "Slack and Zoom", "a"
);
addQ(
  "AI & Automation Strategy", "beginner",
  "What does 'Dynamic Creative Optimization' (DCO) refer to in digital advertising?",
  "Using AI and machine learning algorithms to automatically assemble and serve personalized ad variations (images, headlines, CTAs) tailored in real-time to each user", "Manually exporting JPEG graphics from design software", "Scheduling social media posts manually on a calendar", "Printing physical flyers in different color variations", "a"
);
addQ(
  "AI & Automation Strategy", "beginner",
  "In marketing automation, what is a 'Webhook'?",
  "An automated real-time HTTP notification/payload sent from one application to another immediately when a specific trigger event occurs", "A fishing metaphor for writing clickbait headlines", "A tool for fixing broken links on a website", "A physical cable connecting computers in a local area network", "a"
);
addQ(
  "AI & Automation Strategy", "beginner",
  "What is 'Predictive AI' versus 'Generative AI' in marketing applications?",
  "Predictive AI analyzes historical data to forecast future behavior (e.g., churn risk, lead scoring); Generative AI creates new content (text, images, video, copy)", "Predictive AI writes blog posts; Generative AI tracks website cookies", "Predictive AI is only used by search engines; Generative AI is for email only", "There is no technical distinction between the two", "a"
);

// Intermediate (8-15)
addQ(
  "AI & Automation Strategy", "intermediate",
  "What is 'RAG' (Retrieval-Augmented Generation) in AI-powered marketing and customer knowledge systems?",
  "A framework that retrieves proprietary external facts/documents from a vector database to ground LLM responses with accurate, company-specific information and prevent hallucinations", "A method for automatically generating random email subject lines", "An algorithm for resizing display ad images across different screen sizes", "A compression protocol for web video streaming", "a"
);
addQ(
  "AI & Automation Strategy", "intermediate",
  "Scenario: A marketing operations team wants to automate inbound lead routing: when a form is submitted on HubSpot, enrich the company revenue via Clearbit/Apollo API, score the lead, and alert the assigned account executive on Slack. What is this workflow called?",
  "Automated Lead Enrichment & Routing Pipeline", "Manual Database Replication", "Static Content Management System", "Batch File Transfer Protocol", "a"
);
addQ(
  "AI & Automation Strategy", "intermediate",
  "What is 'AI Hallucination' and what risk does it pose when deploying automated AI content generation without human-in-the-loop review?",
  "When an AI model generates factually incorrect, fabricated, or nonsensical information with high linguistic confidence, risking brand credibility and legal compliance", "When an AI computer monitor displays distorted colors", "When an AI model works 100x faster than expected", "When an AI script crashes the web hosting server", "a"
);
addQ(
  "AI & Automation Strategy", "intermediate",
  "What is a 'Vector Database' (e.g., Pinecone, Weaviate, Qdrant) and why is it used in enterprise AI marketing search?",
  "Stores high-dimensional mathematical embeddings of text/media to enable semantic similarity search rather than basic keyword string matching", "A database designed exclusively for storing vector SVG illustration files", "A spreadsheet software for accounting departments", "A legacy relational database for storing credit card numbers", "a"
);
addQ(
  "AI & Automation Strategy", "intermediate",
  "Scenario: An e-commerce brand wants to deploy AI-generated product descriptions across 20,000 SKUs. What represents best-practice governance?",
  "Establish programmatic brand voice guidelines, provide structured attribute data inputs, use few-shot prompt examples, and implement automated QA filters with human spot-checks", "Let an open-source LLM run with zero prompt instructions directly to live production", "Copy and paste competitor product descriptions into an AI spinner", "Generate only 1 description and duplicate it across all 20,000 products", "a"
);
addQ(
  "AI & Automation Strategy", "intermediate",
  "What role does 'Zero-Shot' vs. 'Few-Shot' prompting play when instructing LLMs for marketing copywriting?",
  "Zero-Shot provides no examples and relies solely on the prompt instruction; Few-Shot provides 2-5 explicit exemplar pairs demonstrating the exact desired style, tone, and format", "Zero-Shot uses zero words; Few-Shot uses 5 words", "Zero-Shot is for image generation; Few-Shot is for text generation", "There is no difference in output precision", "a"
);
addQ(
  "AI & Automation Strategy", "intermediate",
  "In marketing analytics, how does 'AI-Powered Anomaly Detection' protect marketing ad spend?",
  "Machine learning algorithms continuously monitor conversion and traffic telemetry to instantly alert marketers or pause campaigns if CPA spikes or tracking fails", "By automatically deleting negative customer reviews from social media", "By designing new logo graphics whenever sales decrease", "By sending promotional emails during holidays", "a"
);
addQ(
  "AI & Automation Strategy", "intermediate",
  "What is 'Agentic AI' (Autonomous AI Agents) in marketing workflow automation?",
  "AI systems capable of autonomous multi-step reasoning, tool execution (browsing web, querying APIs, running SQL), and iterative goal completion with minimal human intervention", "A human customer service agent who uses a laptop", "A pre-recorded voice message on a telemarketing phone line", "A basic static HTML contact form", "a"
);

// Advanced (16-20)
addQ(
  "AI & Automation Strategy", "advanced",
  "Scenario: An enterprise media publisher wants to build an automated, real-time AI content engine while maintaining strict editorial standards, zero hallucinations, and high search authority. What is the optimal architecture?",
  "Orchestrate a multi-agent system (Research Agent -> Drafting Agent -> Fact-Checking RAG Agent -> Brand Voice Agent) with mandatory human editor approval gates before publishing", "Run an unconstrained cron script that auto-publishes 1,000 raw ChatGPT drafts directly to WordPress every night", "Block all human editors from viewing the CMS", "Scrape competitor RSS feeds and rephrase them with AI without fact checking", "a"
);
addQ(
  "AI & Automation Strategy", "advanced",
  "In generative AI model fine-tuning (e.g., LoRA / SFT) for proprietary enterprise marketing vs. In-Context Prompt Engineering, when is fine-tuning technically justified?",
  "When a brand requires deep, permanent adaptation to a highly specialized jargon, proprietary internal voice, or complex structured output format that cannot fit reliably in context windows", "When the marketing team wants to write a single 200-word blog post", "When the company wants to avoid paying for cloud computing", "Fine-tuning is never necessary under any technical circumstance", "a"
);
addQ(
  "AI & Automation Strategy", "advanced",
  "Scenario: A growth marketing team wants to automate personalization on landing pages for 100,000 B2B enterprise accounts. How is this built at scale using Edge AI?",
  "Lookup visitor IP via reverse-DNS / firmographic API at the Edge Worker layer, pass company industry/persona into an optimized lightweight LLM or pre-cached embedding matrix, and dynamically inject custom headlines and case studies in <50ms", "Prompt a human copywriter to manually write 100,000 separate HTML pages", "Force every visitor to choose their industry from a 500-option dropdown", "Redirect all enterprise visitors to a blank page", "a"
);
addQ(
  "AI & Automation Strategy", "advanced",
  "What are the major data privacy and intellectual property (IP) risks of feeding proprietary customer PII and company trade secrets into public commercial LLM APIs without enterprise zero-data-retention agreements?",
  "Proprietary data may be logged, stored on external vendor servers, and potentially ingested into future training datasets, creating catastrophic regulatory (GDPR/HIPAA) and IP exposure", "The LLM will automatically publish the company's financial records on social media", "The LLM will shut down the company's local Wi-Fi router", "Public LLMs charge 100x higher prices for company data", "a"
);
addQ(
  "AI & Automation Strategy", "advanced",
  "When evaluating AI Model Drift and Evaluation Metrics (e.g., ROUGE, BLEU, G-Eval with LLM-as-a-Judge) in automated marketing production pipelines, how is quality regression prevented?",
  "Establish continuous automated evaluation benchmarks running golden reference test sets with LLM-as-a-judge scoring criteria, alerting engineering if output quality or safety drops below threshold", "Restart the server computer once every week", "Assume the AI model never changes or degrades over time", "Disable all logging to save server storage space", "a"
);

console.log(`Total questions generated: ${rawData.length}`);

// Generate SQL Content
let sqlOutput = `-- ==============================================================================
-- DATABASE SEED SCRIPT: 180 PRODUCTION-GRADE DIGITAL MARKETING QUIZ QUESTIONS
-- Target Table: public.quiz_questions
-- Total Questions: 180 (20 Questions x 9 Core Categories)
-- Structure: 1-7 (Beginner), 8-15 (Intermediate), 16-20 (Advanced)
-- Options Format: JSONB Array of { id, text }
-- ==============================================================================

-- 1. Ensure Table Structure Exists
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  skill_category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON public.quiz_questions(skill_category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON public.quiz_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_is_active ON public.quiz_questions(is_active);

-- 3. Clear Existing Questions (Optional / Idempotent Reset)
-- DELETE FROM public.quiz_questions;

-- ==============================================================================
-- 4. INSERT 180 ACCREDITATION QUESTIONS
-- ==============================================================================

`;

for (const q of rawData) {
  sqlOutput += createSqlInsert(q) + "\n\n";
}

sqlOutput += `-- ==============================================================================
-- END OF SEED SCRIPT (180 QUESTIONS LOADED)
-- ==============================================================================
`;

fs.writeFileSync(path.join(__dirname, '../supabase/seed_quiz_questions_180.sql'), sqlOutput, 'utf8');
console.log('Successfully wrote supabase/seed_quiz_questions_180.sql');
