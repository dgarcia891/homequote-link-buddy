import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { PageMeta } from "@/components/PageMeta";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ProviderLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/provider/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Try to link to existing buyer record
    if (data.user) {
      const { data: buyer } = await supabase
        .from("buyers")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle();

      if (buyer) {
        await supabase.from("buyer_profiles").insert({
          buyer_id: buyer.id,
          user_id: data.user.id,
        });
      }
    }

    setLoading(false);
    toast({
      title: "Check your email",
      description: "We sent a confirmation link. Verify your email to continue.",
    });
  };

  return (
    <>
      <PageMeta title="Provider Login | HomeQuoteLink" description="Log in to manage your provider profile and respond to reviews." />
      <Header />
      <main className="container flex justify-center py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif text-primary">Provider Portal</CardTitle>
            <CardDescription>Manage your profile, respond to reviews, and get more customers</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="p-login-email">Email</Label>
                    <Input id="p-login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-login-password">Password</Label>
                    <Input id="p-login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Log In
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="p-signup-email">Business Email</Label>
                    <Input id="p-signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Must match your buyer account email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-signup-password">Password</Label>
                    <Input id="p-signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Provider Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Are you a homeowner? <Link to="/login" className="text-primary hover:underline">Homeowner login →</Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
