import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Plus, FolderOpen, Server, HardDrive, Network as NetworkIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  displaytext: string;
  vms: number;
  volumes: number;
  networks: number;
  created: string;
}

const initialProjects: Project[] = [
  { id: 'proj-1', name: 'production', displaytext: 'Production Environment', vms: 5, volumes: 8, networks: 2, created: '2023-09-01T10:00:00Z' },
  { id: 'proj-2', name: 'staging', displaytext: 'Staging & QA', vms: 3, volumes: 4, networks: 1, created: '2023-11-15T09:00:00Z' },
  { id: 'proj-3', name: 'dev-team', displaytext: 'Development Team', vms: 4, volumes: 6, networks: 2, created: '2024-01-05T10:00:00Z' },
];

export function UserProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [displaytext, setDisplaytext] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !displaytext) { toast.error('Name and display text are required'); return; }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: name.toLowerCase().replace(/\s+/g, '-'),
        displaytext,
        vms: 0,
        volumes: 0,
        networks: 0,
        created: new Date().toISOString(),
      };
      setProjects((prev) => [newProject, ...prev]);
      toast.success(`Project "${displaytext}" created successfully`);
      setOpen(false);
      setName('');
      setDisplaytext('');
    } catch {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Organize your resources by project.">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Project
        </Button>
      </PageHeader>

      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 space-y-4 text-muted-foreground"
        >
          <FolderOpen className="h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">No projects yet</p>
          <p className="text-sm">Create your first project to organize resources.</p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj, i) => (
            <motion.div
              key={proj.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <Card className="border-border/50 hover:border-primary/50 transition-colors group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <FolderOpen className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{proj.displaytext}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{proj.name}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <Server className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold">{proj.vms}</p>
                      <p className="text-xs text-muted-foreground">VMs</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <HardDrive className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold">{proj.volumes}</p>
                      <p className="text-xs text-muted-foreground">Volumes</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <NetworkIcon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold">{proj.networks}</p>
                      <p className="text-xs text-muted-foreground">Networks</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created {new Date(proj.created).toLocaleDateString()}</span>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <ExternalLink className="mr-1.5 h-3 w-3" /> View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input placeholder="e.g., my-project" value={name} onChange={(e) => setName(e.target.value)} />
              <p className="text-xs text-muted-foreground">Lowercase letters, numbers, hyphens only.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Text</label>
              <Input placeholder="e.g., My Production Environment" value={displaytext} onChange={(e) => setDisplaytext(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreate} disabled={loading}>
                {loading ? 'Creating…' : 'Create Project'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
