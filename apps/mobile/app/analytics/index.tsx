import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  Dimensions 
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  limit 
} from 'firebase/firestore';
import { 
  TrendingUp, 
  Award, 
  Wallet, 
  PackageCheck,
  Star as StarIcon
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db } from '../../services/firebase';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/Colors';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { uid, role } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!uid) return;

    const fetchData = async () => {
      try {
        if (role === 'supplier') {
          // Fetch Supplier Stats
          const adsSnap = await getDocs(query(collection(db, 'supplyAds'), where('supplierId', '==', uid)));
          const offersSnap = await getDocs(query(collection(db, 'offers'), where('supplierId', '==', uid)));
          
          const acceptedOffers = offersSnap.docs.filter(d => d.data().status === 'accepted');
          const totalRevenue = acceptedOffers.reduce((sum, d) => sum + (d.data().quantity * d.data().pricePerUnit), 0);
          
          setStats({
            totalAds: adsSnap.size,
            acceptRate: offersSnap.size > 0 ? ((acceptedOffers.length / offersSnap.size) * 100).toFixed(0) : 0,
            revenue: totalRevenue.toLocaleString(),
          });

          // Mock breakdown for chart
          setChartData([
            { value: 50, label: 'Veg', frontColor: COLORS.primaryGreen },
            { value: 80, label: 'Fruit', frontColor: '#F59E0B' },
            { value: 30, label: 'Grain', frontColor: '#3B82F6' },
            { value: 90, label: 'Spice', frontColor: '#EF4444' },
          ]);
        } else {
          // Fetch Business Stats
          const demandsSnap = await getDocs(query(collection(db, 'demandPosts'), where('businessId', '==', uid)));
          const fulfilled = demandsSnap.docs.filter(d => d.data().status === 'filled').length;
          
          setStats({
            totalDemands: demandsSnap.size,
            fulfillmentRate: demandsSnap.size > 0 ? ((fulfilled / demandsSnap.size) * 100).toFixed(0) : 0,
          });
          
          setChartData([
             { value: 40, label: 'Q1', frontColor: COLORS.primaryGreen },
             { value: 65, label: 'Q2', frontColor: COLORS.primaryGreen },
             { value: 75, label: 'Q3', frontColor: COLORS.primaryGreen },
             { value: 85, label: 'Q4', frontColor: COLORS.primaryGreen },
          ]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid, role]);

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
     <View className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex-1 mx-2">
        <View className="w-10 h-10 rounded-xl items-center justify-center mb-4" style={{ backgroundColor: `${color}10` }}>
           <Icon size={20} color={color} />
        </View>
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</Text>
        <Text className="text-xl font-black text-slate-900 mt-1">{value}</Text>
     </View>
  );

  if (loading) return <ActivityIndicator className="flex-1" color={COLORS.primaryGreen} />;

  return (
    <ScrollView 
       className="flex-1 bg-slate-50"
       contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top + 20 }}
    >
       <View className="px-8 mb-8">
          <Text className="text-3xl font-black text-slate-900 uppercase tracking-tight">Analytics</Text>
          <Text className="text-slate-500 font-medium mt-1">Your marketplace performance overview.</Text>
       </View>

       <View className="flex-row px-6 mb-8">
          <StatCard 
             icon={role === 'supplier' ? TrendingUp : PackageCheck} 
             label={role === 'supplier' ? 'Accept Rate' : 'Fill Rate'} 
             value={`${role === 'supplier' ? stats.acceptRate : stats.fulfillmentRate}%`} 
             color={COLORS.primaryGreen} 
          />
          <StatCard 
             icon={Wallet} 
             label={role === 'supplier' ? 'Revenue' : 'Suppliers'} 
             value={role === 'supplier' ? `Rs.${stats.revenue}` : '14'} 
             color="#6366F1" 
          />
       </View>

       <View className="mx-6 bg-slate-900 p-8 rounded-[3rem] shadow-xl shadow-black/20 mb-10">
          <View className="flex-row items-center mb-10">
             <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-4">
                <Award size={20} color="white" />
             </View>
             <View>
                <Text className="text-white font-black uppercase text-xs tracking-widest">Growth Forecast</Text>
                <Text className="text-white/60 text-[10px] font-bold">Category Distribution</Text>
             </View>
          </View>
          
          <BarChart
             data={chartData}
             width={width - 120}
             height={180}
             barBorderRadius={8}
             frontColor={COLORS.primaryGreen}
             noOfSections={3}
             yAxisThickness={0}
             xAxisThickness={0}
             hideRules
             yAxisTextStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}
             xAxisLabelTextStyle={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}
          />
       </View>

       <View className="px-8">
          <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Recent Achievement</Text>
          <View className="bg-white p-6 rounded-3xl border border-slate-100 flex-row items-center shadow-sm">
             <View className="w-14 h-14 rounded-2xl bg-amber-50 items-center justify-center mr-5">
                <StarIcon size={24} color="#FBBF24" fill="#FBBF24" />
             </View>
             <View className="flex-1">
                <Text className="text-slate-900 font-black uppercase text-xs">Top Rated Producer</Text>
                <Text className="text-slate-500 text-xs font-medium mt-1">Maintaining a 4.9 average across 20+ trades this month.</Text>
             </View>
          </View>
       </View>
    </ScrollView>
  );
}
