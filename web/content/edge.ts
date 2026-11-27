// The Qdrant Edge page of qdrant.tech (/edge/, read 2026-11-26 from the site's source), word for word, for
// web/pages/edge.tsx. The demos' footage (JPG and video) becomes drawn covers (web/visuals/edge.tsx); the hero's
// second heading ("Run Vector Search Inside Embedded and Edge AI Systems") repeats the H1 and isn't shown, and its
// two paragraphs are one description. Icons are Lucide, the site's own.

import type { Faq } from "./conversion"
import type { Link } from "./site"
import type { Feature } from "./sections"

export const edgeHero = {
  kicker: "Edge Vector Search",
  title: "Run Vector Search On Device",
  description:
    "Qdrant Edge is an embedded vector search engine that runs inside your application process, with no Docker, no background service, and an install footprint of around 11 MB. Ship it on robots, kiosks, home assistants, and mobile phones, or anywhere connectivity is limited or intermittent, then sync with a central Qdrant server when you need to.",
  primary: {
    label: "Get Started",
    href: "/documentation/edge/edge-quickstart/",
  } as Link,
  secondary: {
    label: "Read Documentation",
    href: "/documentation/edge/",
  } as Link,
  note: {
    text: "Qdrant Edge is in beta as of August 2026. The API and functionality may change in future releases.",
  },
  code: `pip install qdrant-edge-py

from qdrant_edge import (
    Distance, EdgeConfig, EdgeShard,
    EdgeVectorParams, Query, QueryRequest,
)

config = EdgeConfig(
    vectors={"text": EdgeVectorParams(size=384, distance=Distance.Cosine)}
)
shard = EdgeShard.create("./edge", config)

results = shard.query(
    QueryRequest(
        query=Query.Nearest(query_vector, using="text"),
        limit=10,
    )
)`,
}

// "Same Qdrant, Device Or Cluster": the four demos, each with its links and where it runs.
export const edgeDemos = {
  kicker: "Demos",
  title: "Same Qdrant, Device Or Cluster",
  description:
    "The filters, hybrid queries and sync you run on a Qdrant server, running on robots, wearables, cameras and field hardware. Four applications on real footage: open one, search it, then read the code.",
  items: [
    {
      title: "Edge Mission Control",
      text: "If you build robots, their memory can't depend on the Wi-Fi, so Qdrant Edge recalls every object seen, offline.",
      tag: "Runs in the browser",
      links: [
        {
          label: "Live Demo",
          href: "https://qdrant-edge-mission-control.vercel.app/",
        },
        {
          label: "GitHub",
          href: "https://github.com/qdrant-labs/edge-mission-control",
        },
        {
          label: "Read the Post",
          href: "/blog/qdrant-edge-on-device-vector-search/",
        },
      ],
    },
    {
      title: "Smart Glasses",
      text: "Wearable makers need to search what the camera saw without footage leaving the device.",
      tag: "Runs in the browser",
      links: [
        { label: "Live Demo", href: "https://smart-glasses-edge.vercel.app/" },
        { label: "GitHub", href: "https://github.com/qdrant/qdrant-edge-demo" },
      ],
    },
    {
      title: "Sentinel",
      text: "Security teams can't watch every camera. Sentinel scores twelve feeds against normal and escalates the rest.",
      tag: "Runs in the browser",
      links: [
        { label: "Live Demo", href: "https://sentinel-edge-demo.vercel.app/" },
        {
          label: "GitHub",
          href: "https://github.com/qdrant/video-anomaly-edge",
        },
        {
          label: "Three-Part Tutorial",
          href: "/documentation/tutorials-build-essentials/video-anomaly-edge-part-1/",
        },
      ],
    },
    {
      title: "Edge Visual Search",
      text: "If you run devices in the field, you need answers on site and the record at headquarters. Qdrant Edge syncs both.",
      tag: "Runs in the browser",
      links: [
        { label: "Live Demo", href: "https://edge-visual-search.vercel.app/" },
        {
          label: "GitHub",
          href: "https://github.com/qdrant-labs/devrel-projects/tree/main/qdrant-edge-nextjs",
        },
      ],
    },
  ] as Feature[],
}

// "Why Use Qdrant Edge".
export const edgeWhy = {
  title: "Why Use Qdrant Edge",
  action: {
    label: "Check Out Our Demo",
    href: "https://github.com/qdrant/qdrant-edge-demo",
  } as Link,
  items: [
    {
      icon: "WifiOff",
      tag: "Works Offline",
      title: "Built for limited or intermittent connectivity.",
      text: "Search runs locally whether the link is up or down, and your application can queue writes for the server until it returns.",
    },
    {
      icon: "Zap",
      tag: "Ultra-Low Latency",
      title: "No network round trip.",
      text: "Qdrant Edge runs inside your application process, so a query reads straight from local disk.",
    },
    {
      icon: "Lock",
      tag: "Data Privacy",
      title: "Data stays on the device.",
      text: "Nothing goes to an external server unless your application syncs it.",
    },
  ] as Feature[],
}

// "Search Locally, Sync Centrally": the four cards, each with its drawing (web/visuals/edge.tsx).
export const edgeSync = {
  kicker: "What You Get",
  title: "Search Locally, Sync Centrally",
  description:
    "Running on the device doesn't mean the device is on its own. Each Edge Shard is self-contained, manages its own vector and payload storage, and runs search locally. Sync it with a collection on a central Qdrant server.",
  items: [
    {
      title: "Build the index where the compute is.",
      text: "Building an index takes more compute than an edge device has. Write your points to a Qdrant server as well as the local shard, let the server build the index, and sync back only the segments that changed.",
    },
    {
      title: "Back up and restore a device.",
      text: "Push a shard's data to a central Qdrant server, and restore it when a device is replaced, reset, or provisioned for the first time.",
    },
    {
      title: "Analyze across the whole fleet.",
      text: "Pull data from Edge Shards across your fleet into one Qdrant server when you need to query or analyze across devices rather than within one.",
    },
    {
      title: "Keep the fleet on the same data.",
      text: "Synchronize Edge Shards through a central Qdrant server to keep every device working from the same set.",
    },
  ] as Feature[],
}

// "From Install To First Query": the steps, and the banner under them as the section's line and link.
export const edgeSteps = {
  kicker: "How to Get Started",
  title: "From Install To First Query",
  description:
    "Install a library and open a file on disk. There is no container to build and nothing to run between your calls.",
  action: {
    label: "Read The Qdrant Edge Synchronization Guide",
    href: "/documentation/edge/edge-synchronization-guide/",
  } as Link,
  steps: [
    {
      title: "Create or load an Edge Shard on local disk.",
      text: "Install the Python bindings with pip install qdrant-edge-py, or add the qdrant-edge crate for Rust. Call create to start a new shard at a path you choose, or load to open one that already has data.",
    },
    {
      title: "Update and query it directly from your application.",
      text: "Write and query points in the same process, with no client to configure and no connection to open. Call flush to persist writes and optimize to compact the shard. Nothing runs between your calls.",
    },
    {
      title: "Synchronize with a central Qdrant server whenever you need to.",
      text: "Apply a partial snapshot from the server with update_from_snapshot in Python, or recover_partial_snapshot in Rust.",
    },
  ],
}

// "Everything Runs On The Device": three tabs, two with the site's code, one with a drawing.
export const edgeOnDevice = {
  kicker: "On-Device Inference",
  title: "Everything Runs On The Device",
  description:
    "Dense, sparse, and multivector search, hybrid queries, and payload filtering run in your process on the device, with the same query primitives as Qdrant server.",
  items: [
    {
      title: "Embed With FastEmbed",
      text: "Generate vector embeddings directly on the device with FastEmbed, so both halves of a retrieval step run in the same process.",
      link: {
        label: "Read About On-Device Embeddings",
        href: "/documentation/edge/edge-fastembed-embeddings/",
      },
    },
    {
      title: "Run Hybrid Search",
      text: "Prefetch dense and BM25 sparse results inside the same shard and fuse them with Reciprocal Rank Fusion, in-process and offline.",
      link: { label: "On-Device BM25", href: "/documentation/edge/edge-bm25/" },
    },
    {
      title: "Filter And Facet On Payload",
      text: "Store payload next to your vectors, filter on it at query time, and keep live facet counts per class.",
      link: {
        label: "See It Running",
        href: "/documentation/edge/edge-quickstart/",
      },
    },
  ] as Feature[],
  code: [
    `from fastembed import ImageEmbedding, TextEmbedding

TEXT_MODEL_NAME='Qdrant/clip-ViT-B-32-text'
VISION_MODEL_NAME='Qdrant/clip-ViT-B-32-vision'
MODELS_DIR="./qdrant-edge-directory/models"

ImageEmbedding(
    model_name=VISION_MODEL_NAME,
    cache_dir=MODELS_DIR
)

TextEmbedding(
    model_name=TEXT_MODEL_NAME,
    cache_dir=MODELS_DIR
)`,
    `from qdrant_edge import (
    EdgeConfig,
    EdgeShard,
    EdgeSparseVectorParams,
    Modifier,
)

config = EdgeConfig(
    sparse_vectors={"text":
EdgeSparseVectorParams(modifier=Modifier.Idf)}
,
)

shard = EdgeShard.create(SHARD_DIRECTORY, config)`,
  ],
}

// "Built For Constrained Devices": the cards, the code in two languages, and the link.
export const edgeHardware = {
  kicker: "Hardware Fit",
  title: "Built For Constrained Devices",
  action: {
    label: "Read The Qdrant Edge Quickstart",
    href: "/documentation/edge/edge-quickstart/",
  } as Link,
  tabs: [
    {
      label: "Python",
      code: `from pathlib import Path

SHARD_DIRECTORY = "./qdrant-edge-directory"

Path(SHARD_DIRECTORY).mkdir(parents=True, exist_ok=True)`,
    },
    {
      label: "Rust",
      code: `const SHARD_DIRECTORY: &str = "./qdrant-edge-directory";

fs_err::create_dir_all(SHARD_DIRECTORY)?;`,
    },
  ],
  items: [
    {
      title: "Runs on devices with no room for a database process.",
      text: "Qdrant Edge uses CPU and memory only while your application is calling it, so it isn't taking resources from the model running alongside it.",
    },
    {
      title: "Each device carries its own shard.",
      text: "An Edge Shard is self-contained and operates independently, so adding a device means creating another shard rather than scaling a cluster.",
    },
    {
      title: "Python and Rust today.",
      text: "Qdrant Edge ships Python bindings on PyPI and the qdrant-edge crate on crates.io. If your application uses another language, talk to us before you commit to an architecture.",
    },
  ] as Feature[],
}

// "FAQs". The last answer's link ("Edge vs. Qdrant Cluster") is kept as its words.
export const edgeFaq = {
  title: "FAQs",
  items: [
    {
      question:
        "How is Qdrant Edge different from running Qdrant on a small machine?",
      answer:
        "Qdrant Server uses a client-server architecture: you run it as a process and talk to it over the network. Qdrant Edge runs inside your application process instead, as an embedded library with no background services. Think of it as SQLite, but for vector search. There's no server to deploy, no port to expose, and no network hop between your application and its data.",
    },
    {
      question: "How does synchronization with a central Qdrant server work?",
      answer:
        "Qdrant Edge provides APIs to synchronize an Edge Shard with a Qdrant server collection. Apply a partial snapshot to the shard with update_from_snapshot in Python or recover_partial_snapshot in Rust. You can use this to offload indexing to a more powerful instance, back up and restore data, aggregate data from multiple devices centrally, or keep devices consistent with each other.",
    },
    {
      question: "Which languages does Qdrant Edge support?",
      answer:
        "Python and Rust. Install the Python bindings with pip install qdrant-edge-py, or add the qdrant-edge crate. Examples for both are in the Qdrant GitHub repository. If you need another language, talk to us before committing to an architecture.",
    },
    {
      question: "Can I generate embeddings on the device?",
      answer:
        "Yes. Generate vector embeddings on-device with FastEmbed, and BM25 sparse embeddings on-device for keyword search. Both have their own guides in the Qdrant Edge documentation.",
    },
    {
      question: "Is Qdrant Edge ready for production?",
      answer:
        "Qdrant Edge is in beta as of August 2026, and the API and functionality may change in future releases. It's publicly available and you can start building with it today. Talk to us about your device class and timeline if you need stability guarantees.",
    },
    {
      question: "Which Qdrant features does Qdrant Edge support?",
      answer:
        "Qdrant Edge supports dense, sparse, and multivector search, named vectors, hybrid search, quantization, HNSW indexing, and payload indexes on all field types. It differs from Qdrant server in operations: you run optimization and indexing yourself, and there's no replication or distributed mode. See Edge vs. Qdrant Cluster for the full comparison.",
    },
    {
      question: "What can an Edge Shard do?",
      answer:
        "An Edge Shard manages its own vector and payload storage and performs search and retrieval locally. The API covers creating and loading a shard, updating and querying data, faceting, scrolling, counting, retrieving by ID, flushing to disk, optimizing, reading shard metadata, and applying snapshots.",
    },
  ] as Faq[],
}

export const edgeCta = {
  title: "Start Building On Qdrant Edge",
  description:
    "Install the bindings, create a shard on local disk, and query it in the same process. Provision a Qdrant Cloud cluster when you want a central collection to synchronize with.",
  primary: {
    label: "pip install qdrant-edge-py",
    href: "https://pypi.org/project/qdrant-edge-py/",
  } as Link,
  secondary: {
    label: "Read the Quickstart",
    href: "/documentation/edge/edge-quickstart/",
  } as Link,
}
