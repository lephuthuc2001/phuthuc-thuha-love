'use client';

import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';
import { Button } from '@/components/ui/button';

const client = generateClient<Schema>();

export function MigrationTool() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const runMigration = async () => {
    setStatus('running');
    setLog([]);
    addLog('Starting migration...');

    try {
      // 1. Fetch all memories
      const { data: memories } = await client.models.Memory.list();
      addLog(`Found ${memories.length} memories.`);

      for (const memory of memories) {
        const oldImages = (memory as any).images || [];
        
        if (oldImages.length === 0) {
          addLog(`Memory "${memory.title}" has no old images. Skipping.`);
          continue;
        }

        addLog(`Checking attachments for "${memory.title}" (${oldImages.length} images)...`);

        // Check if attachments already exist to avoid duplicates
        const { data: existingAttachments } = await client.models.MemoryAttachment.list({
          filter: { memoryId: { eq: memory.id } }
        });

        const existingPaths = existingAttachments.map(a => a.path);
        const toAdd = oldImages.filter((p: string) => !existingPaths.includes(p));

        if (toAdd.length === 0) {
          addLog(`  All images for "${memory.title}" already migrated.`);
          continue;
        }

        addLog(`  Migrating ${toAdd.length} new attachments for "${memory.title}"...`);
        
        await Promise.all(
          toAdd.map((path: string) => 
            client.models.MemoryAttachment.create({
              memoryId: memory.id,
              path,
              type: 'IMAGE'
            })
          )
        );
        addLog(`  Success for "${memory.title}".`);
      }

      addLog('Migration complete! 🎉');
      setStatus('done');
    } catch (err: any) {
      console.error(err);
      addLog(`Error: ${err.message}`);
      setStatus('error');
    }
  };

  return (
    <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-white max-w-xl mx-auto my-10">
      <h3 className="text-xl font-bold mb-4">Database Migration Tool</h3>
      <p className="text-sm text-white/60 mb-6">
        This tool will copy S3 paths from the old <code>images</code> field 
        to the new <code>MemoryAttachment</code> model.
      </p>

      {status === 'idle' && (
        <Button onClick={runMigration} className="bg-pink-600 hover:bg-pink-700">
          Run Migration
        </Button>
      )}

      {status === 'running' && (
        <div className="flex items-center gap-2 text-pink-400">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Migrating data...</span>
        </div>
      )}

      {(status === 'done' || status === 'error' || status === 'running') && (
        <div className="mt-6 space-y-1 max-h-40 overflow-y-auto bg-black/20 p-3 rounded-lg text-[10px] font-mono">
          {log.map((entry, i) => (
            <div key={i}>{entry}</div>
          ))}
        </div>
      )}

      {status === 'done' && (
        <p className="mt-4 text-green-400 font-bold">Migration Finished!</p>
      )}
    </div>
  );
}
