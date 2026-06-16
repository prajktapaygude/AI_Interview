// scripts/ingest.js
const fs = require('fs');
const path = require('path');
const { LocalIndex } = require('vectra');
const { pipeline } = require('@xenova/transformers');

let pdfParse;
try {
    pdfParse = require('pdf-parse');
} catch (e) {
    console.error('❌ pdf-parse not installed. Run: npm install pdf-parse');
    process.exit(1);
}

const INDEX_PATH = path.join(__dirname, '../data/vectra-index');
const KNOWLEDGE_DIR = path.join(__dirname, '../knowledge_base');
const CHUNK_SIZE = 300; // Reduced from 500 to save tokens

let embedder = null;

async function getEmbedder() {
    if (!embedder) {
        console.log('📥 Loading embedding model (first time only, may take a moment)...');
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return embedder;
}

function chunkText(text, size) {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.substring(i, i + size));
    }
    return chunks;
}

async function extractTextFromPdf(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        return pdfData.text;
    } catch (error) {
        console.error(`\n❌ Error reading PDF ${filePath}:`, error.message);
        return '';
    }
}

async function ingest() {
    console.log('🚀 Starting ingestion...');
    const embedModel = await getEmbedder();

    const index = new LocalIndex(INDEX_PATH);
    if (!await index.isIndexCreated()) {
        await index.createIndex();
        console.log('✅ Created new Vectra index.');
    } else {
        console.log('✅ Loaded existing Vectra index.');
    }

    const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => 
        f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.pdf')
    );

    if (files.length === 0) {
        console.log('⚠️ No .txt, .md, or .pdf files found in knowledge_base.');
        process.exit(0);
    }

    for (const file of files) {
        console.log(`\n📄 Processing ${file}...`);
        const filePath = path.join(KNOWLEDGE_DIR, file);
        const ext = path.extname(file).toLowerCase();
        
        let content = '';
        if (ext === '.txt' || ext === '.md') {
            content = fs.readFileSync(filePath, 'utf8');
        } else if (ext === '.pdf') {
            content = await extractTextFromPdf(filePath);
            if (!content || content.trim().length === 0) {
                console.log(`   ⚠️ Warning: No text extracted from ${file}. Skipping.`);
                continue;
            }
        } else {
            console.log(`   ⚠️ Skipping ${file} – unsupported.`);
            continue;
        }

        const chunks = chunkText(content, CHUNK_SIZE);
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (chunk.trim().length === 0) continue;

            const output = await embedModel(chunk, { pooling: 'mean', normalize: true });
            const vector = Array.from(output.data);
            await index.insertItem({
                vector: vector,
                metadata: { text: chunk, source: file, chunkIndex: i }
            });
            process.stdout.write(`\r   -> Added chunk ${i+1}/${chunks.length}`);
        }
        console.log(`\n   ✅ Added ${chunks.length} chunks from ${file}`);
    }
    console.log('\n🎉 Ingestion complete!');
    process.exit(0);
}

ingest().catch(console.error);