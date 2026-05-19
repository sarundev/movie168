import { getServerUser } from "../lib/server-auth";
import { fetchMe, fetchWatchHistory, fetchMyPurchases, type ApiUser, type ApiPurchase, type ApiWatchHistory } from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProfileContent from "./ProfileContent";

export default async function ProfilePage() {
  const user = await getServerUser();

  let initialProfile: ApiUser | null = null;
  let initialHistory: ApiWatchHistory[] = [];
  let initialPurchases: ApiPurchase[] = [];
  let initialBalance = 0;
  let initialCredits = 0;

  if (user?.token) {
    try {
      const [profileResult, historyResult, purchasesResult] = await Promise.allSettled([
        fetchMe(user.token),
        fetchWatchHistory(user.token),
        fetchMyPurchases(user.token),
      ]);

      if (profileResult.status === "fulfilled") {
        initialProfile = profileResult.value;
        initialBalance = profileResult.value.balance ?? 0;
        initialCredits = profileResult.value.credit_balance ?? 0;
      }
      if (historyResult.status === "fulfilled") {
        initialHistory = historyResult.value;
      }
      if (purchasesResult.status === "fulfilled") {
        initialPurchases = purchasesResult.value;
      }
    } catch {}
  }

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />
      <ProfileContent
        user={user}
        initialProfile={initialProfile}
        initialHistory={initialHistory}
        initialPurchases={initialPurchases}
        initialBalance={initialBalance}
        initialCredits={initialCredits}
      />
      <Footer />
    </div>
  );
}
