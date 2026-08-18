# Content Department — Skills Index

7 skills for the Content department workers. Match every task to the right skill before acting.

| Keyword triggers | Skill | When to use |
| --- | --- | --- |
| thread, tweet, X, twitter, viral, hook | `x-thread-writer` | Writing X/Twitter threads or punchy multi-tweet takes |
| linkedin, post, thought leadership, founder, carousel | `linkedin-post-writer` | LinkedIn posts, founder POV, carousel outlines |
| youtube, tiktok, reels, video script, script | `youtube-script-writer` | YouTube or TikTok/Reels scripts |
| calendar, schedule, pillars, cadence, plan | `content-calendar` | Weekly/monthly content planning and pillar definition |
| repurpose, transform, blog, podcast, case study | `content-repurposing` | Converting long-form content to multi-platform posts |
| generate video, ai video, clip, kling, shotstack | `video-creator` | AI video generation from script — LTX draft → Kling final → stitch |
| approve, publish, submit, slack review, post | `slack-approval-publisher` | Submitting drafts for HITL approval then publishing |

## Skills

### 1. `x-thread-writer`

**Use when:** writing X/Twitter threads, topic breakdowns, punchy multi-tweet takes.

**Workflow:** Single strongest insight → hook tweet (open loop / contrarian / metric-led / admission) → body tweets 2-8 (one idea each) → proof tweet → CTA tweet → links in first reply.

**Success:** Hook withholds resolution, each tweet stands alone, one CTA, no fabricated stats.

---

### 2. `linkedin-post-writer`

**Use when:** LinkedIn posts, thought leadership, founder POV, carousel outlines.

**Workflow:** Choose format → hook (2 lines max) → radical white space body (900-1200 chars) → close → 3-5 niche hashtags.

**Success:** Hook stops scroll, body scannable on mobile, 900-1200 chars.

---

### 3. `youtube-script-writer`

**Use when:** YouTube videos or TikTok/Reels scripts.

**Workflow:** One-sentence promise → hook (3-30s) → Problem-Stakes-Solution-Proof body → [PATTERN INTERRUPT] every 60s → CTA bridge → final CTA.

**Success:** Hook resolves in 3s (TikTok) or 15s (YouTube), PSSP structure, visual cues throughout.

---

### 4. `content-calendar`

**Use when:** planning weekly or monthly content schedule, defining content pillars.

**Workflow:** Define 3-5 pillars → set cadence → web_search trending topics → write per-post briefs → save as markdown table.

**Success:** All briefs self-contained, trending topics sourced, full period covered.

---

### 5. `content-repurposing`

**Use when:** transforming a blog post, podcast, case study, or data report into multi-platform content.

**Workflow:** Ingest source → extract thesis + insights → X thread (distinct hook) → LinkedIn (different angle) → TikTok script (visual) → save all outputs.

**Success:** Each piece is platform-native, three distinct angles, summary documents changes.

---

### 6. `video-creator`

**Use when:** generating AI video from a script or brief for YouTube, TikTok/Reels, or LinkedIn.

**Workflow:** Load script → break into 3-12 clips → draft via fal.ai LTX-Video → quality review → final via Kling 3.0 → stitch via Shotstack → Slack HITL approval → publish.

**Provider stack:**

- Draft: `fal-ai/ltx-video` (~$0.004-0.005/s, fast)
- Final: Kling 3.0 via `api.klingai.com` (best motion quality)
- Fallback: `fal-ai/seedance-v1-5` (temporal consistency)
- Assembly: Shotstack render API

**Success:** clip_manifest.json + video_output.json exist, Slack approval sent before any publish, outcome file written.

---

### 7. `slack-approval-publisher`

**Use when:** submitting finished draft for human review before publishing.

**Workflow:** Read draft → post_to_slack (full draft in code block + task_id) → request_approval (24h HITL) → on approved: publish via platform API → on rejected: log + notify.

**Success:** Slack notified before HITL request, both approve/reject paths handled, no silent failures.

---

## Sources

Skills compiled from:

- `vercel/ai@experimental_generateVideo` (38K stars) — video generation provider interface
- `fal-ai-community/video-starter-kit` (2.4K stars) — video pipeline patterns
- `remotion-dev/remotion` (43.5K stars) — video assembly reference
- `vargHQ/sdk` (2026) — JSX-for-videos declarative composition pattern
- `charlie947/social-media-skills` — X thread hook frameworks, LinkedIn white space pattern
- `coreyhaines31/marketingskills` — content calendar cadence, repurposing workflow
- Influencer strategy research (2026): MrBeast hook science, LinkedIn algorithm, TikTok 6-9 PM window
