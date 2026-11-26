// The blog (/blog/, page 1) and one post (/blog/qdrant-1.20.x/) from qdrant.tech, read 2026-11-26, word for word, for
// web/pages/blog.tsx and blog-post.tsx. Thumbnails are JPGs in web/assets/blog, cut from the Lightspeed concept
// (Figma: Qdrant Brand Design, "Concept 2 · Lightspeed", 23789:39119), the only images the blog uses (design lead,
// 2026-11-26); the Poliscope case study gets the concept's partner card instead (web/visuals/blog.tsx). The post's
// decorative section banners are left out, and its figures are redrawn as diagrams (web/visuals/diagrams).

import { ASSETS } from "../lib/assets"
import type { Link } from "./site"
import type { Post, ProseBlock } from "./listings"

const img = (name: string) => `${ASSETS}/blog/${name}.jpg`

export const blogPage = {
  // The page opens on its posts under this heading, the page's H1, with the search beside it (design lead, 2026-11-26;
  // the site's "Qdrant Blog" header and its line are gone).
  heading: "Qdrant Features and News",
  search: { placeholder: "What are you Looking for?" },
  featured: {
    title: "Qdrant 1.20 - Full-Text Search Improvements",
    href: "/blog/qdrant-1.20.x/",
    excerpt:
      "Version 1.20 of Qdrant brings BM25 scoring on full-text indexes, a code tokenizer, faster nested filters, 16-bit and 8-bit TurboQuant, and cluster security hardening.",
    authors: "Andrey Vasnetsov",
    date: "October 22, 2026",
    image: img("lightspeed-rings"),
  } as Post,
  // Beside the featured post, as on the site: titles only.
  next: [
    {
      title: "UltraBERT Fits 32K Tokens in One Vector. RIP Chunking?",
      href: "/blog/ultrabert-embed/",
      authors: "Dylan Couzon, Anush",
      date: "October 19, 2026",
    },
    {
      title:
        "Reachy Remembers: Giving a Robot a Local Semantic Memory with Qdrant Edge",
      href: "/blog/reachy-robot-memory-qdrant-edge/",
      authors: "Sasha Denisov & Chadha Sridi",
      date: "October 14, 2026",
    },
    {
      title:
        "Perplexity's New Late-Interaction Models Meet Qdrant's 21x Vector Compression",
      href: "/blog/pplx-embed-v2/",
      authors: "Dylan Couzon, Anush",
      date: "October 13, 2026",
    },
  ] as Post[],
  // The rest of page 1, in the site's order. The Poliscope post's visual is set by the page.
  posts: [
    {
      title:
        "Does a Code-Tuned Embedding Model Pay Off? papr-embed-code-1 in Qdrant",
      href: "/blog/papr-embed-code/",
      excerpt:
        "papr-embed-code-1 in Qdrant: code retrieval against its Qwen3-Embedding base, 1-bit TurboQuant, BM25 with the code tokenizer, and 1M filtered snippets.",
      authors: "Dylan Couzon, Anush",
      date: "November 18, 2026",
      image: img("lightspeed-data-wall"),
    },
    {
      title: "How to Run an Embedding Model on Bare Metal",
      href: "/blog/embeddings-on-bare-metal/",
      excerpt:
        "A guide on how you can run a small static embedding model on an ESP32 chip with 16MB of flash memory using `no_std` Rust",
      authors: "Clelia Bertelli",
      date: "November 11, 2026",
      image: img("lightspeed-cockpit"),
    },
    {
      title:
        "Qdrant 1.20 Performance Mechanisms: New TurboQuant Datatypes and Per-Element Indexes",
      href: "/blog/qdrant-1.20-performance/",
      excerpt:
        "Measurements of Qdrant 1.20 performance: turbo8 and turbo16 match float32 recall at a quarter and half of the storage, and per-element indexes make nested filters up to 4 times faster.",
      authors: "Clelia Bertelli",
      date: "November 02, 2026",
      image: img("lightspeed-station"),
    },
    {
      title:
        "Scalable PDF Retrieval with Cohere Embed 5 and Qdrant Asymmetric Quantization",
      href: "/blog/cohere-embed-5-qdrant/",
      excerpt:
        "Use Cohere embeddings for visual PDF retrieval in Qdrant. Compare ViDoRe results and combine small vectors in RAM with full vectors on disk.",
      authors: "Evgeniya Sukhodolskaya",
      date: "October 23, 2026",
      image: img("lightspeed-graph"),
    },
    {
      title:
        "How Poliscope Made All of Germany's Local Politics Searchable on One Server with Qdrant",
      href: "/blog/case-study-poliscope/",
      excerpt:
        "How Poliscope indexed about 4,800 German council portals into one self-hosted Qdrant collection of 130M points: hybrid search, tenant and prefix filtering, and TurboQuant on one bare-metal server, taking mean search time from 20 seconds to 0.87 seconds.",
      authors: "Daniel Azoulai",
      date: "October 15, 2026",
    },
    {
      title: "Jevjitsu: Or, How We Tried Generalized Classifiers on Everything",
      href: "/blog/jevjitsu/",
      excerpt:
        "We applied the Jev generalized classifier to reranking, query understanding, near-duplicate removal, and semantic chunking.",
      authors: "Andrei Cristea & Chadha Sridi",
      date: "October 08, 2026",
      image: img("lightspeed-astronaut"),
    },
    {
      title: "How Small Can Google's New EmbeddingGemma 2 Get?",
      href: "/blog/embeddinggemma-2/",
      excerpt:
        "Google's EmbeddingGemma 2 in Qdrant: 99% of retrieval quality in 30x less vector RAM, or 94.5% in 77x less with rescoring.",
      authors: "Qdrant Team",
      date: "October 06, 2026",
      image: img("lightspeed-rings"),
    },
    {
      title: "Constella Preview: Swap Query Models Without Re-Embedding",
      href: "/blog/constella-research-preview/",
      excerpt:
        "Swap query models without re-embedding documents. Explore Constella Zero, Nano, and Stella, with BEIR-15 results and CPU benchmarks.",
      authors: "Dylan Couzon",
      date: "September 29, 2026",
      image: img("lightspeed-data-wall"),
    },
    {
      title: "Oxidizing Cross-Encoders",
      href: "/blog/oxidizing-cross-encoders/",
      excerpt:
        "Learnings from writing a cross-encoder inference library in Rust and comparing it with existing Python packages.",
      authors: "Clelia Bertelli",
      date: "September 25, 2026",
      image: img("lightspeed-cockpit"),
    },
  ] as Post[],
  // The site's 22 pages of posts, linked as /blog/page/N/.
  pagination: { current: 1, total: 22, base: "/blog/" },
  cta: {
    title: "Get Started with Qdrant Free",
    primary: {
      label: "Get Started",
      href: "https://cloud.qdrant.io/signup",
    } as Link,
  },
}

// The post, whole: its intro, sections and notes, with its figures named by id for the page to draw.
export const releasePostFull = {
  title: "Qdrant 1.20 - Full-Text Search Improvements",
  authors: "Andrey Vasnetsov",
  date: "October 22, 2026",
  hero: img("lightspeed-rings"),
  tocTitle: "On this page:",
  share: [
    {
      label: "Share on X",
      href: "https://twitter.com/intent/tweet?url=https%3A%2F%2Fqdrant.tech%2Fblog%2Fqdrant-1.20.x%2F&text=Qdrant%201.20%20-%20Full-Text%20Search%20Improvements",
    },
    {
      label: "Share on LinkedIn",
      href: "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fqdrant.tech%2Fblog%2Fqdrant-1.20.x%2F",
    },
  ] as Link[],
  blocks: [
    {
      type: "p",
      text: "**Qdrant 1.20.0 is out!** Let’s look at the main features for this version:",
    },
    {
      type: "list",
      items: [
        "**BM25 on Full-Text Indexes and Code Search:** Rank by BM25 straight from your payload text, with no embeddings to generate. Plus, better code search with a new `code` tokenizer.",
        "**Faster Nested Filters:** A new per-element payload index answers nested filters without reading payloads, making them faster.",
        "**16-Bit and 8-Bit TurboQuant:** A 16-bit TurboQuant datatype that halves vector storage without accuracy loss, and an 8-bit TurboQuant datatype and quantization option with recall close to `float16`.",
      ],
    },
    {
      type: "h2",
      id: "bm25-scoring-on-full-text-indexes",
      text: "BM25 Scoring on Full-Text Indexes",
    },
    {
      type: "p",
      text: "In addition to vector search, Qdrant also supports full-text search, which finds results by the exact words they contain. Until now, ranking those results with BM25, a commonly used ranking function for keyword search, meant converting your text into sparse vectors.",
    },
    {
      type: "p",
      text: "That approach has a few drawbacks. Every document and every query has to go through an inference step to produce its sparse vector. You also have to keep track of the average document length yourself to get accurate scoring. Because that value is fixed in every stored vector, it can’t adapt as your data changes, and updating it means converting all your documents again.",
    },
    {
      type: "p",
      text: "Version 1.20 solves these challenges with BM25 scoring directly on a full-text index. Qdrant derives all BM25 statistics from your data. That includes the average document length, so scoring is accurate out of the box. You don’t need to generate embeddings. Text that’s already in your payload becomes searchable as soon as you index it.",
    },
    { type: "h3", id: "how-it-works", text: "How It Works" },
    {
      type: "p",
      text: "To rank points with BM25 on a full-text index, use the new `text` query. For example, to search a books dataset by title, first create a full-text index on the `title` field with the `bm25` scoring type:",
    },
    {
      type: "code",
      title: "http",
      code: 'PUT /collections/books/index\n{\n  "field_name": "title",\n  "field_schema": {\n    "type": "text",\n    "scoring": {\n      "type": "bm25"\n    }\n  }\n}',
    },
    {
      type: "p",
      text: "Then query the index, and pass the indexed field in `using`:",
    },
    {
      type: "code",
      title: "http",
      code: 'POST /collections/books/points/query\n{\n  "query": {\n    "text": "time travel"\n  },\n  "using": "title"\n}',
    },
    {
      type: "p",
      text: "You can set the BM25 parameters `k` and `b` per query, so tuning them doesn’t require rebuilding the index. A `text` query works anywhere in the Query API. Combine it with dense vector search in hybrid search, or use it to rescore points retrieved by another query.",
    },
    {
      type: "h3",
      id: "migrate-from-sparse-bm25",
      text: "Migrate from Sparse BM25",
    },
    {
      type: "p",
      text: "BM25 on sparse vectors remains supported. If your text is already stored in the payload, you can switch to a full-text index without uploading your data again. Create a full-text index with scoring enabled, configure the same text processing as your sparse BM25 model, and replace your sparse vector queries with `text` queries.",
    },
    {
      type: "h2",
      id: "better-code-search-with-the-code-tokenizer",
      text: "Better Code Search with the Code Tokenizer",
    },
    {
      type: "p",
      text: "A common use case for full-text search is searching through source code. A full-text index uses a tokenizer to split text into the words, or tokens, that you can search for. The default `word` tokenizer splits text on spaces and punctuation, which doesn’t work well for code, because identifiers combine several words in different naming conventions. For example, it indexes `getUserName` as a single token, so a search for `user name` or `get_user_name` doesn’t find it.",
    },
    {
      type: "p",
      text: "This release adds a new `code` tokenizer that splits identifiers on underscores and case changes, including acronyms. As a result, `getUserName`, `get_user_name`, and `user name` all match each other. It also indexes the full identifier, so `hashmap` still finds `HashMap`. Combined with BM25 scoring on a full-text index, this lets you rank code search results without generating embeddings.",
    },
    {
      type: "h2",
      id: "faster-nested-filters-with-per-element-indexes",
      text: "Faster Nested Filters with Per-Element Indexes",
    },
    {
      type: "p",
      text: "Payloads often contain arrays of objects, such as a product with several offers, each with its own shop and price. A nested filter finds points where a single element matches all conditions, for example an offer from a specific shop below a certain price.",
    },
    {
      type: "figure",
      id: "nested-filter",
      alt: "A nested filter on offers requires shop A and a price under $100. Point 7 has a shop A offer and an offer under $100, but they’re different offers, so it doesn’t match. Point 9 has one shop A offer for $80, so it matches.",
    },
    {
      type: "p",
      text: "Until now, payload indexes couldn’t answer these filters on their own. Indexes on `offers[].shop` and `offers[].price` could only narrow down the candidates. Qdrant then read the payload of every remaining candidate, usually from disk, to check the conditions per element. When many candidates remained, nested filters got slow.",
    },
    {
      type: "p",
      text: "With version 1.20, every payload index type gets a new `nested` parameter, which creates a per-element index that stores each array element separately. When every condition in a nested filter uses a field with a per-element index on the same array, Qdrant can answer the filter from the indexes alone, without reading any payloads. The search API doesn’t change, so existing nested filters get faster as soon as you create the indexes.",
    },
    {
      type: "p",
      text: "We benchmarked per-element indexes against regular indexes with payload reads, using three nested filters on 100,000 points. Even with every payload already in memory, the best case for reading payloads, per-element indexes were 7 to 38 times faster. Because they skip payload reads entirely, the gap is likely larger when payloads have to come from disk.",
    },
    {
      type: "h2",
      id: "16-bit-and-8-bit-turboquant",
      text: "16-Bit and 8-Bit TurboQuant",
    },
    {
      type: "p",
      text: "A vector’s datatype determines how Qdrant stores vectors. The default, `float32`, uses 32 bits per dimension. To save storage and memory, and to speed up search, you can use a datatype with fewer bits per dimension, at some cost in accuracy.",
    },
    {
      type: "p",
      text: "Until now, Qdrant offered three lower-precision datatypes. The `turbo4` datatype, introduced in version 1.19, is the most compact option at 4 bits, but on some datasets it has a significant negative effect on recall. `float16` keeps more precision at 16 bits, but takes four times the space. `uint8` sits in between at 8 bits, but unless your embedding model already outputs 8-bit integers, you have to quantize vectors yourself before uploading them.",
    },
    {
      type: "p",
      text: "This release adds two TurboQuant datatypes. `turbo16` uses the same 16 bits as `float16`, but with lower error, and cuts the storage of `float32` vectors in half with no loss in accuracy. `turbo8` uses 8 bits per dimension like `uint8`, but takes regular float vectors and quantizes them for you. It halves storage again, with recall close to `float16`. Version 1.20 also brings the 8-bit encoding to TurboQuant quantization.",
    },
    {
      type: "figure",
      id: "turboquant-datatypes",
      alt: "You upload float32 vectors, and TurboQuant rotates them and rounds them to an integer grid. turbo16 has the same recall as float32, turbo8 comes close to float16, and turbo4 is smallest, but recall can drop.",
    },
    { type: "h3", id: "turbo16-datatype", text: "`turbo16` Datatype" },
    {
      type: "p",
      text: "`turbo16` uses 2 bytes per dimension, the same as `float16`. `float16` keeps the same relative precision for every coordinate, so a large coordinate gets a large rounding error. That costs precision on embeddings with a few very large coordinates, such as OpenAI’s text-embedding-ada-002, CLIP, and Cohere. `turbo16` fixes that by first applying the TurboQuant rotation, which spreads values evenly across coordinates, and then storing each vector on a single 16-bit integer grid.",
    },
    {
      type: "p",
      text: "We compared `turbo16` with `float16` and `float32` in two ways. In a study of reconstruction error over 13 datasets, `turbo16` had 7.5 times lower error than `float16`. In search benchmarks on 12 datasets, `turbo16` recall@10 with exact search matched `float32` within 0.001 on every dataset, while `float16` dropped to 0.995 on the ada-002 and CLIP datasets.",
    },
    {
      type: "p",
      text: "In the same search benchmarks, `turbo16` was also faster than `float16` for HNSW search, with a median latency of 0.81 times that of `float16` on x86 and 0.83 times on ARM.",
    },
    { type: "h3", id: "turbo8-datatype", text: "`turbo8` Datatype" },
    {
      type: "p",
      text: "`turbo8` stores each dimension in 1 byte, half the size of `float16`. We benchmarked it separately, on 11 datasets. The following chart shows recall@10 for `turbo8` compared to `turbo4` and `float16` on six of them. Benchmarks ran on x86 with HNSW configured with `m=16` and `ef_construct=100`, searching with `hnsw_ef=128`.",
    },
    {
      type: "figure",
      id: "turbo8-recall",
      caption:
        "Recall@10 for turbo4, turbo8, and float16 on six datasets, ordered by vector dimensions.",
    },
    {
      type: "p",
      text: "`turbo8` recall comes close to `float16` at half the size, and the gain over `turbo4` is largest at low dimensions, such as SIFT and Deep-image. `turbo8` is also faster than `float16`. Across all 11 benchmarked datasets, its searches were 1.1 to 2.4 times faster than `float16`, and on most datasets within 10% of `turbo4`.",
    },
    {
      type: "p",
      text: "On the same datasets, we also compared `turbo8` with `float32` vectors and scalar quantization, with rescoring enabled. `turbo8` had higher recall on 10 of 11 datasets and tied on the other, at similar latency. Because scalar quantization keeps the `float32` originals, `turbo8` stores only about a fifth of the bytes.",
    },
    { type: "h3", id: "bits8-quantization", text: "`bits8` Quantization" },
    {
      type: "p",
      text: "The 8-bit encoding is also available as TurboQuant quantization over regular float vectors. Set `bits` to `bits8` in the quantization config to use it. `bits8` compresses vectors about four times, compared to eight times for `bits4`. `bits4` remains the default.",
    },
    {
      type: "p",
      text: "If you’re currently using scalar quantization, consider benchmarking `bits8` as an alternative. It compresses vectors by the same four times, and in the `turbo8` benchmarks, the same encoding had higher recall than scalar quantization.",
    },
    {
      type: "h2",
      id: "memory-tiers-for-more-components",
      text: "Memory Tiers for More Components",
    },
    {
      type: "p",
      text: "Version 1.19 introduced memory tiers: a single `memory` parameter that controls whether each component of a collection is `pinned` in RAM, `cached`, or `cold` on disk. Version 1.20 extends memory tiers to the ID tracker and removes the duplicate copy of vectors that inline storage used to keep.",
    },
    { type: "h3", id: "id-tracker-placement", text: "ID Tracker Placement" },
    {
      type: "p",
      text: "The ID tracker maps each point’s ID to its internal location and version. Until now, Qdrant always kept it in RAM, at about 52 bytes per point. For a collection with 100 million points, that’s about 5 GB of RAM.",
    },
    {
      type: "p",
      text: "You can now choose a memory tier for the ID tracker of each collection. `pinned` keeps the ID tracker in RAM and remains the default. `cold` keeps it on disk and reads it on demand. `cached` also keeps it on disk, but loads it into the page cache when Qdrant opens a segment.",
    },
    {
      type: "figure",
      id: "id-tracker-tiers",
      alt: "The ID tracker can be pinned in RAM, which is the default, cached in the page cache when a segment opens, or cold, read from disk. Toward RAM gives faster lookups, toward disk uses less RAM.",
    },
    {
      type: "h3",
      id: "inline-storage-without-duplicate-vectors",
      text: "Inline Storage Without Duplicate Vectors",
    },
    {
      type: "p",
      text: "Inline storage speeds up searches on an HNSW index that’s stored on disk, by placing the original vectors in the index file next to the graph links. Until now, Qdrant stored those vectors twice: once in the regular vector storage and once in the index file. Qdrant now stores the original vectors only in the HNSW index file, which reduces disk usage.",
    },
    {
      type: "p",
      text: "Because the vectors are now part of the index, they follow the memory tier of the index instead of their own. For example, if the vectors are `cold` and the index is `pinned`, the vectors are now pinned in RAM along with the index, which increases RAM usage. The reverse also applies: a `cold` index makes its vectors `cold`. Before upgrading, check that the memory tier of the index fits these vectors.",
    },
    {
      type: "h2",
      id: "cluster-security-hardening",
      text: "Cluster Security Hardening",
    },
    {
      type: "p",
      text: "In a distributed deployment, Qdrant peers communicate over an internal gRPC API. In this release, the internal API becomes harder to reach and harder to misuse: it now requires authentication by default, and you can bind it to a separate network interface.",
    },
    {
      type: "h3",
      id: "internal-authentication-by-default",
      text: "Internal Authentication by Default",
    },
    {
      type: "p",
      text: "When an API key is configured, Qdrant now requires it on internal requests by default and rejects requests to the internal port that don’t carry a valid key. The internal API also accepts only read-write keys, and rejects the read-only key and all JWTs.",
    },
    {
      type: "p",
      text: "Clusters without an API key aren’t affected. If `api_key` is set, rolling upgrades from 1.19 are safe, because peers have sent it on internal requests since version 1.18. Some setups, such as clusters with only a read-only key, need changes first. Read the upgrade notes before upgrading.",
    },
    {
      type: "h3",
      id: "bind-the-internal-port-to-a-private-interface",
      text: "Bind the Internal Port to a Private Interface",
    },
    {
      type: "p",
      text: "Until now, the internal port listened on the same address as the public API. To keep it off a public network, you needed a firewall, a security group, or a similar tool.",
    },
    {
      type: "p",
      text: "The new `cluster.p2p.host` setting binds the internal port to its own address, so it can stay on a private network while the public API keeps its current address. The value must be an IP address, and the node’s peer URI must use the same address. If you don’t set it, the internal port keeps listening on the same address as the public API.",
    },
    { type: "h2", id: "also-in-this-release", text: "Also in This Release" },
    {
      type: "list",
      items: [
        "**Snapshots on GCS and Azure Blob Storage:** In addition to the local file system and S3-compatible storage, you can now store snapshots on Google Cloud Storage and Azure Blob Storage.",
        "**Shared Snapshot Buckets:** A new `prefix` setting for S3, GCS, and Azure lets several deployments share one bucket without overwriting each other’s snapshots.",
        "**Audit Logs to stdout or stderr:** Audit logs can now go to stdout or stderr, instead of or in addition to files. This suits deployments that collect logs from container output.",
        "**Collection Creation Time:** For collections created in version 1.20 or later, collection info now shows when the collection was created.",
        "**Safer Replica Removal:** When you drop a replica, you can now require a minimum number of other active replicas of the same shard.",
        "**Log Timestamps in Local Time:** Log timestamps now follow the `TZ` environment variable. UTC remains the default.",
        "**Substring Match:** A new `substring` match condition selects points whose string value contains a given string, such as part of a URL, a file path, or a product code.",
      ],
    },
    {
      type: "p",
      text: "For a full list of all changes in version 1.20, see the changelog.",
    },
    {
      type: "h2",
      id: "upgrading-to-version-120",
      text: "Upgrading to Version 1.20",
    },
    {
      type: "p",
      text: "On Qdrant Cloud, navigate to the Cluster Details screen and select Version 1.20 from the dropdown menu. The upgrade process may take a few moments.",
    },
    {
      type: "p",
      text: "We recommend upgrading versions one by one. Qdrant Cloud does this automatically when you select the target version. If you’re self-hosting, upgrade to the latest patch version of each intermediate minor version first, for example, 1.18.x→1.19.x→1.20.0.",
    },
    {
      type: "note",
      text: "Version 1.20 clusters enforce authentication on internal communication by default if API keys are set. This affects upgrades as follows:",
      items: [
        "If no API key is set, nothing changes and rolling upgrades from 1.19 are safe.",
        "If `api_key` is set, rolling upgrades from 1.19 are safe.",
        "In clusters with only `read_only_api_key` set, peers will no longer be able to communicate with each other. To fix this, set `api_key`, or set `enforce_internal_auth: false`.",
        "If your cluster sets only `alt_api_key` and runs 1.19.0 or 1.19.1, upgrade to 1.19.2 first.",
      ],
    },
    {
      type: "note",
      text: "Collections that use inline storage may need more RAM after the upgrade. As of version 1.20, the original vectors in these collections follow `hnsw_config.memory` instead of `vectors.memory`, and so do quantized vectors without their own `memory` setting. The HNSW index defaults to `cached`, so with `vectors.memory: cold` and no other settings, the original vectors become `cached` and the quantized vectors are pinned in RAM. Before upgrading, set `hnsw_config.memory`, and `memory` on quantization, to the tiers you want for these vectors.",
    },
    {
      type: "p",
      text: "Need help with your upgrade? The Qdrant Advisor agent skill can help you navigate upgrades, troubleshoot configurations, and answer questions about your Qdrant setup, whether you’re on Qdrant Cloud or self-hosting.",
    },
    {
      type: "h2",
      id: "manage-qdrant-cloud-from-the-terminal",
      text: "Manage Qdrant Cloud from the Terminal",
    },
    {
      type: "p",
      text: "`qcloud`, the Qdrant Cloud CLI, lets you manage clusters, API keys, backups, and Cloud Inference from your terminal. Every command is scriptable, so `qcloud` fits into CI pipelines and gives AI agents a way to operate your Cloud setup. You can also use it to upgrade: `qcloud cluster update <cluster-id> --version v1.20.0` moves a cluster to 1.20 with a rolling restart.",
    },
    { type: "h2", id: "engage", text: "Engage" },
    {
      type: "p",
      text: "We would love to hear your thoughts on this release. If you have any questions or feedback, join our Discord or create an issue on GitHub.",
    },
  ] as ProseBlock[],
}
