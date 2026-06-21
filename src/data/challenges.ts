/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Challenge } from '../types';

export const SYSTEM_CHALLENGES: Challenge[] = [
  {
    id: 'youtube',
    title: 'Design YouTube (Video Platform at Scale)',
    description: 'Build a system that supports uploading raw video, transcoding diverse bitrates, and streaming buffer-free playback to billions of users globally with search and real-time recommendations.',
    stages: [
      {
        id: 1,
        title: 'Stage 1: Video Upload & Transcoding Path',
        subtitle: 'Ingest & Multi-Format Processing Pipeline',
        objective: 'Connect the Creator Client to a scalable infrastructure that securely ingests high-resolution RAW video and transcodes it asynchronously into multi-resolution bitrates (HLS/DASH) without overloading web servers.',
        hints: [
          'Clients should not talk directly to transcoding workers. First, send metadata through a protective Load Balancer/Gateway and Web Server to authenticate and prepare upload keys.',
          'Instead of processing huge video files synchronous on the web node, write metadata to a database, upload raw video directly to blob storage, and notify transcoding workers via a resilient Message Queue (Kafka).',
          'Ensure the Transcoding Worker reads the RAW video, compresses it to various formats, stores the output blobs inside object storage, and updates video metadata status once completed.'
        ],
        anchors: [
          {
            id: 'client-creator',
            type: 'Client',
            label: 'Client (Creator Interface)',
            description: 'The content creator\'s physical web browser or mobile application used to initiate upload sequences and monitor status.',
            isAnchor: true,
            x: 50,
            y: 200,
            referenceJustification: 'Serves as the entry point for content authors. Employs chunked resumable uploads via pre-signed URLs to stream raw files directly to Object Storage, reducing middleware server congestion.'
          },
          {
            id: 'object-storage',
            type: 'Storage',
            label: 'BLOB Storage (Raw & Transcoded)',
            description: 'Ultra-durable, highly-scalable object storage (like Google Cloud Storage or Amazon S3) storing massive video binary files.',
            isAnchor: true,
            x: 750,
            y: 200,
            referenceJustification: 'Stores bulk video binaries. Separates high-frequency structured database indexing from heavy binary blob delivery, allowing raw input staging and transcoded video storage.'
          }
        ],
        palette: [
          {
            id: 'load-balancer',
            type: 'Network',
            label: 'API Gateway & Load Balancer',
            description: 'Intelligently distributes upload request volumes across web hosts, performs rate limiting, and terminates SSL connections.',
            referenceJustification: 'Shields system resources by proxying web routing. Pre-filters malicious upload attempts, applies defensive client rate-limiting, and spreads incoming raw telemetry loads across backend nodes.'
          },
          {
            id: 'api-server',
            type: 'Compute',
            label: 'Web & Upload Servers',
            description: 'Authenticates requests, creates video database rows, and requests pre-signed upload URLs from BLOB Storage.',
            referenceJustification: 'Coordinates ingest handshakes, authenticates uploading profiles, inserts the initial "pending" metadata record, and signs temporary object storage upload tokens for clients.'
          },
          {
            id: 'metadata-db',
            type: 'Database',
            label: 'Metadata Database (SQL)',
            description: 'Durable structured database for system profiles, video information, resolution checklists, and ownership records.',
            referenceJustification: 'Durable master storage for ACID transactions. Relational integrity matters for billing, video ownership records, channel subscriptions, and chunk hashes.'
          },
          {
            id: 'message-queue',
            type: 'Queue',
            label: 'Upload Queue (Kafka)',
            description: 'High-throughput, distributed event queue that buffers transcoding jobs asynchronously.',
            referenceJustification: 'Decouples heavy compute transcodes. Video encoding load of 1080p-4K clips spikes server CPUs; a robust message broker ensures transcode workers consume jobs in orderly queues.'
          },
          {
            id: 'transcoder',
            type: 'Compute',
            label: 'Transcoding Workers',
            description: 'CPU/GPU-heavy nodes that pull transcode jobs, compress raw frames, and output HLS/DASH dynamic playback files.',
            referenceJustification: 'Processes raw binary inputs to generate distinct video streams (e.g. 240p to 4K in MP4/HLS formats), packaging them with audio mixes and updating metadata to "active" upon completion.'
          },
          {
            id: 'acid-chunk-db',
            type: 'Database',
            label: 'Relational Database with ACID Video-Chunk Locks',
            description: 'Monolithic transactional relational table built to segment and insert binary video rows with full ACID transaction safety.',
            isTrap: true,
            trapExplanation: 'Inserting large binary chunks directly into indexed databases leads to extreme write locks, server memory bloat, high index write times, and is a massive scaling architectural anti-pattern. Always store massive binaries in Object Storage and keep metadata separate.',
            referenceJustification: 'Never choose this trap. Binary files reside inside BLOB storage services. SQL databases are reserved for compact, structured metadata indexing, never massive video frames.'
          },
          {
            id: 'monolithic-sync',
            type: 'Compute',
            label: 'Centralized Monolithic Sync Server',
            description: 'A single, master coordinator server that runs synchronous threads to copy raw streams directly to transcode micro-processes.',
            isTrap: true,
            trapExplanation: 'Monolithic single-point-of-failure coordinators cannot withstand global workload scale. Synchronous threads bottleneck easily. A distributed push/pull scheme using Message Queues scales gracefully without coupling.',
            referenceJustification: 'Never choose this trap. Centralized thread coordination creates a classic bottle-neck and halts entire streaming pipelines when the master coordinator fails.'
          }
        ],
        requiredNodes: ['load-balancer', 'api-server', 'metadata-db', 'message-queue', 'transcoder'],
        requiredConnections: [
          { from: 'client-creator', to: 'load-balancer', label: 'Route/Authenticate requests' },
          { from: 'load-balancer', to: 'api-server', label: 'Proxy upload context' },
          { from: 'api-server', to: 'metadata-db', label: 'Write initial metadata' },
          { from: 'client-creator', to: 'object-storage', label: 'Upload raw video chunk blobs' },
          { from: 'api-server', to: 'message-queue', label: 'Enqueue transcode job payload' },
          { from: 'message-queue', to: 'transcoder', label: 'Consume transcoding request' },
          { from: 'transcoder', to: 'object-storage', label: 'Write transcoded segment chunks' }
        ]
      },
      {
        id: 2,
        title: 'Stage 2: Video Playback & Delivery Path',
        subtitle: 'Global Low-Latency Playback Network',
        objective: 'Architect the reading path. Viewers should be able to play dynamically stream-split segments with minimal start-up latency (under 200ms) without saturating original API servers or data disk structures.',
        hints: [
          'Viewers do not fetch static 2GB files. They fetch dynamic playlists of split segments (M3U8). Deliver these cached blobs through a Global Content Delivery Network (CDN) to ensure edge caching.',
          'Place a dynamic Playback Server to sign dynamic permissions, handle streaming format handshakes, and return video-chunk playlists.',
          'To avoid executing deep queries on Metadata Databases every single second a video is clicked, use a high-speed Metadata Cache (Redis) to serve hot video profiles.'
        ],
        anchors: [
          {
            id: 'client-viewer',
            type: 'Client',
            label: 'Client (Viewer Interface)',
            description: 'The end-user viewing device or video player application that streams chunk lists and requests adaptive bitrates.',
            isAnchor: true,
            x: 50,
            y: 200,
            referenceJustification: 'The streaming viewer UI. Requests manifest playlists (.m3u8/.mpd) and adjusts bitrates dynamically based on current local network conditions.'
          },
          {
            id: 'object-storage-playback',
            type: 'Storage',
            label: 'BLOB Storage (Transcoded Videos)',
            description: 'Houses all transcoded audio and video segments, grouped by resolutions.',
            isAnchor: true,
            x: 750,
            y: 350,
            referenceJustification: 'Durable origin data store for video clips. Serves as the backup/source of truth that CDN edges pull from when experiencing cache misses.'
          }
        ],
        palette: [
          {
            id: 'playback-server',
            type: 'Compute',
            label: 'Playback / Streaming API',
            description: 'Validates viewer subscription access, fetches playlist streams, and feeds client media controls.',
            referenceJustification: 'Acts as the control plane for content delivery. Authenticates viewer requests, creates session streams, and resolves chunk playlist keys from cache memory.'
          },
          {
            id: 'cdn',
            type: 'Network',
            label: 'Global CDN (Content Delivery Network)',
            description: 'Redundant geographical edge servers caching dynamic transcoding chunks and asset manifests close to global clients.',
            referenceJustification: 'Acts as the heavy data-delivery engine. Caches transcoded segments geographically closer to downstream video players, offloading origin servers by resolving 95%+ of global stream downloads.'
          },
          {
            id: 'metadata-cache',
            type: 'Cache',
            label: 'Metadata Cache (Redis)',
            description: 'In-memory caching cluster providing lightning-fast reads on highly active video records and counts.',
            referenceJustification: 'Reduces metadata storage spikes. Popular videos generate huge query rates; caching metadata in-memory shields the main master database from high-volume read stress.'
          },
          {
            id: 'metadata-db-read',
            type: 'Database',
            label: 'Metadata Database (Read Copy)',
            description: 'Read-replica database cluster mirroring raw tables to support fallback lookups when CDN or Cache miss.',
            referenceJustification: 'Fallback datastore. Relational replica handling database lookup misses without affecting live, high-priority Metadata write operations.'
          },
          {
            id: 'direct-fs-share',
            type: 'Storage',
            label: 'Shared Network Directory (NFS)',
            description: 'A mounting drive connecting the master system file path directly to the viewer clients via web network calls.',
            isTrap: true,
            trapExplanation: 'NFS directories do not support geographical caching and collapse under heavy concurrent reads. Running user streams directly from raw network drives bypasses edge optimization and will cause extreme buffering latency.',
            referenceJustification: 'Never choose this trap. Mounted system directories do not offer modern streaming optimizations, creating severe single-point failures on direct disk mounts.'
          },
          {
            id: 'torrent-tracker',
            type: 'Network',
            label: 'P2P Seed Tracker Coordinator',
            description: 'Saves viewer web browser IPs and instructs them to upload chunk files to each other to spare database traffic.',
            isTrap: true,
            trapExplanation: 'While P2P is helpful for bulk file synchronization, it suffers from severe initial connection negotiation latency (multi-second startup). It is not suitable for instant consumer stream startup (sub-200ms) demanded by commercial video platforms.',
            referenceJustification: 'Never choose this trap. P2P peer discovery adds major latency overhead and relies too heavily on user upload speeds, breaking live seamless adaptive streaming.'
          }
        ],
        requiredNodes: ['playback-server', 'cdn', 'metadata-cache'],
        requiredConnections: [
          { from: 'client-viewer', to: 'playback-server', label: 'Request streaming playlist manifest' },
          { from: 'playback-server', to: 'metadata-cache', label: 'Query hot video manifest metadata' },
          { from: 'client-viewer', to: 'cdn', label: 'Pull dynamic transcoded video chunk files' },
          { from: 'cdn', to: 'object-storage-playback', label: 'Fetch missing chunk blobs (Cache Miss)' }
        ]
      },
      {
        id: 3,
        title: 'Stage 3: Advanced Optimization & Analytics',
        subtitle: 'Search, Stream Monitoring & Recommendations',
        objective: 'Design of global search, telemetry (watch time tracking), and offline machine learning pipelines ensuring highly reactive user suggestions.',
        hints: [
          'Standard databases do not scale well for fuzzy, type-ahead prefix search. Build a specialized Search Engine (Elasticsearch) to power instantaneous title matchings.',
          'To process high-frequency watch-time logs from browsers without crashing Web API Nodes, log them through an Analytics Message Queue (Kafka).',
          'Use an Analytics Streaming Processor (Spark) to clean watch streams in micro-batches and feed the Recommendation ML Engine to recommend next-watch tables.'
        ],
        anchors: [
          {
            id: 'user-interaction',
            type: 'Client',
            label: 'Viewer Stream Analytics Ingestion',
            description: 'Captures user interactions: video plays, skips, scroll lengths, hover markers, and pause duration.',
            isAnchor: true,
            x: 50,
            y: 200,
            referenceJustification: 'Logs raw viewer events. Generates light, asynchronous micro-payload telemetry data frames pointing to user action matrices.'
          },
          {
            id: 'recommender-system',
            type: 'Compute',
            label: 'Recommendation Engine',
            description: 'Computes user interest vectors, candidate lists, and generates customized homepage layouts.',
            isAnchor: true,
            x: 750,
            y: 200,
            referenceJustification: 'Aggregates behavioral logs and neural embedding layers to index dynamic user candidate lists, outputting tailored personal watchlist rows.'
          }
        ],
        palette: [
          {
            id: 'clickstream-queue',
            type: 'Queue',
            label: 'Clickstream Queue (Kafka)',
            description: 'Buffers heavy real-time user-interaction streams securely before passing to analytics tools.',
            referenceJustification: 'Buffers high-velocity user activity events. Telemetry packets are extremely chatty; a message partition engine isolates micro-write failures.'
          },
          {
            id: 'spark-processor',
            type: 'Compute',
            label: 'Data Processor (Apache Spark)',
            description: 'Consumes logs, aggregates view count streams, and stores processed micro-batch states.',
            referenceJustification: 'Processes high-speed streams. Re-calculates view lists, watch-lengths, and viewer profiles in micro-batches to compute offline recommendation matrices.'
          },
          {
            id: 'search-db',
            type: 'Database',
            label: 'Search Server (Elasticsearch)',
            description: 'Inverted-index engine hosting video metadata optimized for partial words, prefixes, and auto-completion search responses.',
            referenceJustification: 'Supports low-latency search queries. Standard SQL engines cannot run wildcard searches safely at scale; Elasticsearch delivers indexed fuzzy and auto-complete lookups under 20ms.'
          },
          {
            id: 'polling-analytics',
            type: 'Compute',
            label: 'Browser-side Polling Thread Engine',
            description: 'An aggressive client scheduler that continuously polls relational SQL nodes to compute and fetch recommendations every 300ms.',
            isTrap: true,
            trapExplanation: 'Aggressive relational polling generates huge query loads. Relational servers collapse under redundant, heavy queries. Streaming message buffers handle analytics asynchronously, and recommendation models run offline to feed the viewer home cache.',
            referenceJustification: 'Never choose this trap. Relational polling is highly non-scalable and prone to bringing down primary production database nodes.'
          }
        ],
        requiredNodes: ['clickstream-queue', 'spark-processor', 'search-db'],
        requiredConnections: [
          { from: 'user-interaction', to: 'clickstream-queue', label: 'Push viewer watch clickstreams' },
          { from: 'clickstream-queue', to: 'spark-processor', label: 'Consume real-time telemetry items' },
          { from: 'spark-processor', to: 'recommender-system', label: 'Export clean training vectors' },
          { from: 'user-interaction', to: 'search-db', label: 'Query autocomplete and prefix title searches' }
        ]
      }
    ]
  },
  {
    id: 'chat-system',
    title: 'Design real-time Slack/WhatsApp Messenger',
    description: 'Build an ultra-responsive global message pipeline supporting thousands of concurrent active chats, offline message queuing, read indicators, and shared group files.',
    stages: [
      {
        id: 1,
        title: 'Stage 1: Connection & Send Pipeline',
        subtitle: 'Dynamic Socket Establishment & State Management',
        objective: 'Expose a scalable entry barrier that handles persistent, long-lived client web connections (WebSockets / SSE) to broadcast dynamic messages under 100ms.',
        hints: [
          'HTTP connection polling drains user handset battery and causes excessive server overhead. Use a high-efficiency long-lived WebSocket Server layer.',
          'WebSocket connections are stateful. Make sure to authenticate users first via a Load Balancer / API Gateway and Auth Server before opening the socket socket.',
          'To know which specific server holds a user socket, save the current connection mapping state inside a fast Key-Value store (Redis Connection Registry).'
        ],
        anchors: [
          {
            id: 'chat-sender',
            type: 'Client',
            label: 'Client (Sender)',
            description: 'User\'s smart app executing secure write actions and establishing interactive bidirectional socket links.',
            isAnchor: true,
            x: 50,
            y: 200,
            referenceJustification: 'Client initiator. Holds bi-directional lightweight network packets using low-overhead WebSockets to stream JSON payloads instantly.'
          },
          {
            id: 'connection-state',
            type: 'Cache',
            label: 'Connection State Engine (Redis)',
            description: 'Fast, centralized in-memory network schema recording active mapping pairs (e.g., UserId -> WebSocketServerId).',
            isAnchor: true,
            x: 750,
            y: 200,
            referenceJustification: 'Holds ephemeral states. When routing target messages, servers lookup this key-value registry to locate which worker holds the active connection handler to trigger instant broadcasts.'
          }
        ],
        palette: [
          {
            id: 'mesh-gateway',
            type: 'Network',
            label: 'API Gateway & Load Balancer',
            description: 'Accepts connection handshakes, extracts authentication headers, and forwards clients to socket managers.',
            referenceJustification: 'Distributes entry headers, authorizes user authorization cookies, handles TLS/SSL overhead, and forwards clients to specific gateway socket sockets.'
          },
          {
            id: 'websocket-servers',
            type: 'Compute',
            label: 'WebSocket Connection Manager Pool',
            description: 'Maintains long-lived open client sockets, handles message pushes, and updates connection state maps.',
            referenceJustification: 'Handles light stateful duplex connections. Buffers messages, monitors keep-alive pings, and updates the Redis session registry upon socket connection or disconnection.'
          },
          {
            id: 'message-broker',
            type: 'Queue',
            label: 'Pub/Sub Message Broker (Redis PubSub / RabbitMQ)',
            description: 'Distributes and transfers messages across WebSocket servers. Solves the split-server messaging problem.',
            referenceJustification: 'Solves multi-server broadcast targets. If Bob is on SocketServer A and Alice is on SocketServer B, the broker channels the payload across backend nodes so alice gets pushed instantly.'
          },
          {
            id: 'acid-lockdown',
            type: 'Database',
            label: 'Heavy Partitioned SQL Locked Store',
            description: 'A relational cluster that locks rows sequentially whenever a user joins a channel or sends simple messages',
            isTrap: true,
            trapExplanation: 'Row locking in relational databases prevents fast broadcasts. Real-time communication requires low-latency ephemeral connection caches. Acquiring locks across transactional tables will halt messages.',
            referenceJustification: 'Never choose this trap. Relational tables are too slow to hold high-frequency state mappings, crashing messaging clusters.'
          }
        ],
        requiredNodes: ['mesh-gateway', 'websocket-servers', 'message-broker'],
        requiredConnections: [
          { from: 'chat-sender', to: 'mesh-gateway', label: 'Attempt authentication API' },
          { from: 'mesh-gateway', to: 'websocket-servers', label: 'Handshake WebSockets upgrade' },
          { from: 'websocket-servers', to: 'connection-state', label: 'Register current connection (UserId -> ServerId)' },
          { from: 'websocket-servers', to: 'message-broker', label: 'Publish message event pipeline' }
        ]
      }
    ]
  }
];

export const COMPONENT_QUESTION_BANK: Record<string, { question: string; placeholder: string }[]> = {
  Client: [
    {
      question: 'How should this client handle connectivity loss (offline mode) while users continue interacting?',
      placeholder: 'Explain retry queue, optimistic UI updates, or local indexed data buffers...'
    },
    {
      question: 'What optimization secures client authorization before high-volume writes hit resource pools?',
      placeholder: 'Explain pre-signed tokens, client-side signature validations, API rate limit headers...'
    }
  ],
  Compute: [
    {
      question: 'Is this component stateful or stateless? How do you scale it horizontally to 10x spikes?',
      placeholder: 'Describe load balancer auto-scaling groups, stateless token validation, session caches...'
    },
    {
      question: 'What strategy resolves cascading server failures if one compute cluster becomes extremely slow?',
      placeholder: 'Discuss circuit breakers, timeout fallback defaults, rate-limit throttlers, dead-letter routes...'
    }
  ],
  Database: [
    {
      question: 'Why is this specific database type (NoSQL, SQL, Search Engine) selected for this layout?',
      placeholder: 'Contrast high-throughput writes, strict transactional schemas, or reverse-index fuzzy lookups...'
    },
    {
      question: 'What read replication or write scaling strategy allows this database to sustain millions of global queries?',
      placeholder: 'Explain read replicas, sharded keys, cluster patterns, or materialized views...'
    }
  ],
  Queue: [
    {
      question: 'How does this queue prevent downstream workers from being crushed by volume (backpressure)?',
      placeholder: 'Discuss polling pull intervals, buffer thresholds, topic partition limits, consumer auto-scaling...'
    },
    {
      question: 'What delivery guarantee (e.g. at-least-once) is needed here, and how are duplicate messages handled?',
      placeholder: 'Discuss unique message dedup keys, idempotent database upsets, sliding window deduplication...'
    }
  ],
  Cache: [
    {
      question: 'What eviction policy (e.g. LRU) and TTL (Time-To-Live) strategy is appropriate for this data?',
      placeholder: 'Define LRU/LFU cache policies, short/long-lived TTL guidelines for hot video properties...'
    },
    {
      question: 'How do you handle cache invalidation when master database values are updated?',
      placeholder: 'Discuss write-through caches, pub/sub triggers, event-driven invalidation workflows...'
    }
  ],
  Network: [
    {
      question: 'How is high geographical latency resolved for global users contacting this component?',
      placeholder: 'Introduce global geo-DNS routing, edge proxy servers, distributed endpoints...'
    },
    {
      question: 'What security mitigations should be placed at this layer to handle malicious request surges?',
      placeholder: 'Explain DDoS scrubbing, web application firewall (WAF) rule sets, SSL termination gateways...'
    }
  ],
  Storage: [
    {
      question: 'How do you optimize storage costs for records that are rarely read after 30 days?',
      placeholder: 'Define cloud storage tier tier transitions (e.g., Hot to Cool to Cold/Archive S3 classes)...'
    },
    {
      question: 'How do clients write to or read from this storage without sharing global root credentials?',
      placeholder: 'Mention pre-signed upload/download URLs, narrow scope IAM policies, temporary security tokens...'
    }
  ]
};
