import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMyGroups, useCreateGroup, useJoinGroup, useGroupMembers } from "@/hooks/useGroups";
import { motion } from "framer-motion";
import { Users, Plus, Copy, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function Groups() {
  const { data: groups, isLoading } = useMyGroups();
  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [code, setCode] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { data: members } = useGroupMembers(selectedGroup);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const group = await createGroup.mutateAsync({ name: name.trim(), description: desc.trim() || undefined });
    toast.success(`Group created! Code: ${group.invite_code}`);
    setName(""); setDesc(""); setShowCreate(false);
  };

  const handleJoin = async () => {
    if (!code.trim()) return;
    try {
      await joinGroup.mutateAsync(code.trim());
      toast.success("Joined group!");
      setCode(""); setShowJoin(false);
    } catch {
      toast.error("Invalid invite code");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }} className="btn-gradient" size="sm">
          <Plus className="h-4 w-4 mr-1" /> Create Group
        </Button>
        <Button onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }} variant="outline" size="sm">
          <LogIn className="h-4 w-4 mr-1" /> Join Group
        </Button>
      </div>

      {showCreate && (
        <Card className="glass-card-premium">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Button onClick={handleCreate} disabled={!name.trim()} className="btn-gradient w-full">Create</Button>
          </CardContent>
        </Card>
      )}

      {showJoin && (
        <Card className="glass-card-premium">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Invite code" value={code} onChange={(e) => setCode(e.target.value)} />
            <Button onClick={handleJoin} disabled={!code.trim()} className="btn-gradient w-full">Join</Button>
          </CardContent>
        </Card>
      )}

      {/* Groups List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !groups || groups.length === 0 ? (
        <Card className="glass-card-premium">
          <CardContent className="p-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No groups yet. Create or join one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {groups.map((group) => (
            <motion.div key={group.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card
                className={`glass-card-premium hover-float cursor-pointer ${selectedGroup === group.id ? "ring-1 ring-primary/30" : ""}`}
                onClick={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{group.name}</p>
                      {group.description && <p className="text-xs text-muted-foreground">{group.description}</p>}
                      <span className="text-[10px] text-muted-foreground">Role: {group.myRole}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(group.invite_code);
                        toast.success("Code copied!");
                      }}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="h-3 w-3" /> {group.invite_code}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Members */}
      {selectedGroup && members && (
        <Card className="glass-card-premium">
          <CardHeader>
            <CardTitle className="font-display text-sm">Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-2 text-sm">
                <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                  {(m.profiles?.display_name || "?").charAt(0).toUpperCase()}
                </div>
                <span className="text-foreground">{m.profiles?.display_name || "Anonymous"}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{m.role}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
