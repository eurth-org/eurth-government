# Roadmap

Governmint is a tool, not a game: you set up a country and it tells you what you've built. It's for anyone, with Eurth in the background as the community that makes it and the first world whose countries you can browse.

## What sets it apart

The Filteries Political Simulator (2016–2018) and its successor StateCrafter answer "which real-world ideology is this?". Governmint answers "what is my country like, and does it hold together?"

1. **Builds a country, doesn't grade a quiz.** The result is a country profile you can paste into a wiki infobox, a forum post or an image card.
2. **No account.** The whole country lives in its link.
3. **Explains itself.** Every label shows which settings produced it. The rules live in readable data files, so changes are reviewed as pull requests.
4. **Catches contradictions.** A "pacifist" state spending 8% of GDP on its army, or quantitative easing without a central bank.
5. **Search and compare.** Put countries side by side, or filter a whole world of them.
6. **Works everywhere.** Mobile-first, accessible, light and dark.

## Features

| Area | What |
| --- | --- |
| Government | Extent of the state (city, country, world); unitary, federal or confederal; who may govern; how the executive, legislature and courts are chosen; electoral system and suffrage; religion and the state; armed forces, conscription and foreign policy; immigration and migrants' rights |
| Law and society | What's legal or illegal across crime, sex work, guns, gambling, drugs, LGBT rights, abortion, euthanasia, speech, blasphemy, dissent and treason; women's and minority rights; environmental rules |
| Economy and budget | Sectors with public, private or cooperative ownership, taxes, tariffs, subsidies and price or wage controls; central bank and monetary tools; minimum wage, pensions, welfare and basic income; spending; GDP and the budget balance |
| Analysis | Names for the type of state, government, economy and society; ideology axes and charts; why each label applies; contradiction checks; two countries side by side |
| Discover | Filter and rank a set of countries by economy, geography, society and government; Eurth's countries as the first dataset |
| Share | Settings in the link; export to wiki infobox (IIWiki, Fandom), Markdown, BBCode, JSON or an image card; embeddable on other sites |
| Learn | Ready-made examples, a guided mode for beginners |

Not planned: accounts, saved galleries, comments, or anything else that needs a server. If per-country link previews ever matter, the Worker could render those images later.

## Phases

Each phase ships on its own.

| Phase | What | Outcome |
| --- | --- | --- |
| **0. Groundwork** | Repo, licence, static site, Worker config, CI | Placeholder page live at gov.eurth.org |
| **1. Model on paper** | Settings, axes and naming rules as data files in our own words, with test cases ("these settings make a parliamentary monarchy") | The model every later phase builds on |
| **2. Government** | Government settings, the labels with explanations, settings in the link | A first version people can try |
| **3. Economy and budget** | Sectors, taxes, spending, GDP balance, charts | Economy covered |
| **4. Law and society** | The legal or illegal settings, grouped clearly | Society covered |
| **5. Sharing** | Wiki, BBCode, Markdown and image exports; examples; contradiction checks | Ready to use in real worldbuilding |
| **6. Discover** | Filter and compare a world's countries, starting with Eurth | Depends on a country dataset |
| **7. Launch** | Replace old Filteries links in Eurth's Worldbuilding Tools docs, announce on the forum and Discord, add to status.eurth.org | Live and findable |
