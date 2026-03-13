import { useState, useMemo } from "react";
import { Calendar } from "lucide-react";
import type { Campaign } from "../types";
import { CampaignDetailModal } from "./campaign-detail-modal";

interface CalendarViewProps {
  campaigns: Campaign[];
  onDeleteCampaign: (id: string) => void;
  onEditCampaign: (id: string) => void;
}

interface CampaignRow {
  campaign: Campaign;
  row: number;
  startCol: number;
  span: number;
}

export function CalendarView({ campaigns, onDeleteCampaign, onEditCampaign }: CalendarViewProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const months = useMemo(() => {
    return [
      { month: currentMonth, year: currentYear },
      { month: (currentMonth + 1) % 12, year: currentMonth === 11 ? currentYear + 1 : currentYear },
    ];
  }, [currentMonth, currentYear]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isToday = (date: Date) => {
    const todayStr = today.toISOString().split("T")[0];
    const dateStr = date.toISOString().split("T")[0];
    return todayStr === dateStr;
  };

  const isPastDate = (date: Date) => {
    const todayStr = today.toISOString().split("T")[0];
    const dateStr = date.toISOString().split("T")[0];
    return dateStr < todayStr;
  };

  // キャンペーンを行に配置するロジック
  const layoutCampaigns = (month: number, year: number) => {
    const firstDay = getFirstDayOfMonth(month, year);
    const daysInMonth = getDaysInMonth(month, year);
    
    // この月に関連するキャンペーンを取得
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month, daysInMonth);
    
    const relevantCampaigns = campaigns.filter((campaign) => {
      const campStart = new Date(campaign.startDate);
      const campEnd = new Date(campaign.expiryDate);
      return campStart <= monthEnd && campEnd >= monthStart;
    });

    const campaignRows: CampaignRow[] = [];
    const occupiedCells: boolean[][] = []; // [row][day]

    relevantCampaigns.forEach((campaign) => {
      const campStart = new Date(campaign.startDate);
      const campEnd = new Date(campaign.expiryDate);
      
      // この月での表示開始日と終了日を計算
      const displayStart = campStart < monthStart ? 1 : campStart.getDate();
      const displayEnd = campEnd > monthEnd ? daysInMonth : campEnd.getDate();
      
      // グリッド上の���位置を計算（週の開始からのオフセットを含む）
      const startCol = firstDay + displayStart - 1;
      const endCol = firstDay + displayEnd - 1;
      const span = endCol - startCol + 1;
      
      // 配置可能な行を見つける
      let row = 0;
      while (true) {
        if (!occupiedCells[row]) {
          occupiedCells[row] = [];
        }
        
        // この行のstartColからendColまでが空いているかチェック
        let canPlace = true;
        for (let col = startCol; col <= endCol; col++) {
          if (occupiedCells[row][col]) {
            canPlace = false;
            break;
          }
        }
        
        if (canPlace) {
          // この行に配置
          for (let col = startCol; col <= endCol; col++) {
            occupiedCells[row][col] = true;
          }
          campaignRows.push({ campaign, row, startCol, span });
          break;
        }
        
        row++;
      }
    });

    return { campaignRows, maxRow: occupiedCells.length };
  };

  const getCampaignColor = (campaign: Campaign) => {
    // 企業名のハッシュ値から色を決定
    const hash = campaign.company.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-500 hover:bg-blue-600',
      'bg-purple-500 hover:bg-purple-600',
      'bg-green-500 hover:bg-green-600',
      'bg-pink-500 hover:bg-pink-600',
      'bg-indigo-500 hover:bg-indigo-600',
      'bg-orange-500 hover:bg-orange-600',
      'bg-teal-500 hover:bg-teal-600',
    ];
    return colors[hash % colors.length];
  };

  const renderMonth = (month: number, year: number) => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const { campaignRows, maxRow } = layoutCampaigns(month, year);
    
    const weeks = [];
    let week = [];
    
    // 空白セルを追加
    for (let i = 0; i < firstDay; i++) {
      week.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 bg-gray-50" />);
    }
    
    // 日付セルを追加
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isCurrentDay = isToday(date);
      const isPast = isPastDate(date);
      
      week.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 relative ${
            isCurrentDay ? "bg-blue-50" : isPast ? "bg-gray-50" : "bg-white"
          }`}
        >
          <div className={`absolute top-1 right-1 text-sm ${
            isCurrentDay ? "font-bold text-blue-600 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center" 
            : isPast ? "text-gray-400" : "text-gray-700"
          }`}>
            {day}
          </div>
        </div>
      );
      
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    
    // 最後の週を追加
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(<div key={`empty-end-${week.length}`} className="h-24 border border-gray-200 bg-gray-50" />);
      }
      weeks.push(week);
    }
    
    return { weeks, campaignRows, maxRow };
  };

  const monthNames = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月"
  ];
  
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <>
      <div className="space-y-8">
        {months.map(({ month, year }) => {
          const { weeks, campaignRows } = renderMonth(month, year);
          
          return (
            <div key={`${year}-${month}`} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  {year}年 {monthNames[month]}
                </h2>
              </div>
              
              <div className="relative">
                {/* 曜日ヘッダー */}
                <div className="grid grid-cols-7 gap-0 mb-0">
                  {dayNames.map((dayName, index) => (
                    <div
                      key={dayName}
                      className={`text-center font-semibold text-sm py-2 border border-gray-200 ${
                        index === 0 ? "text-red-600 bg-red-50" : index === 6 ? "text-blue-600 bg-blue-50" : "text-gray-700 bg-gray-50"
                      }`}
                    >
                      {dayName}
                    </div>
                  ))}
                </div>
                
                {/* カレンダーグリッド */}
                <div className="relative">
                  <div className="grid grid-cols-7 gap-0">
                    {weeks.flat()}
                  </div>
                  
                  {/* キャンペーンバー（オーバーレイ） */}
                  <div className="absolute inset-0 pointer-events-none">
                    {campaignRows.map(({ campaign, row, startCol, span }) => {
                      const weekRow = Math.floor(startCol / 7);
                      const colInWeek = startCol % 7;
                      
                      // 週をまたぐ場合は分割して表示
                      const bars = [];
                      let remainingSpan = span;
                      let currentWeekRow = weekRow;
                      let currentCol = colInWeek;
                      
                      while (remainingSpan > 0) {
                        const spaceInWeek = 7 - currentCol;
                        const barSpan = Math.min(remainingSpan, spaceInWeek);
                        
                        bars.push(
                          <div
                            key={`${campaign.id}-${currentWeekRow}-${currentCol}`}
                            className={`absolute pointer-events-auto cursor-pointer ${getCampaignColor(campaign)} text-white px-2 py-1 text-xs font-medium truncate transition-all shadow-sm`}
                            style={{
                              top: `${currentWeekRow * 96 + row * 24 + 28}px`,
                              left: `${(currentCol / 7) * 100}%`,
                              width: `${(barSpan / 7) * 100}%`,
                              height: '20px',
                              borderRadius: currentCol === colInWeek && remainingSpan === span 
                                ? (barSpan === span ? '4px' : '4px 0 0 4px')
                                : (remainingSpan === barSpan ? '0 4px 4px 0' : '0'),
                            }}
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            {currentCol === colInWeek && (
                              <span>{campaign.company}: {campaign.title}</span>
                            )}
                          </div>
                        );
                        
                        remainingSpan -= barSpan;
                        currentWeekRow++;
                        currentCol = 0;
                      }
                      
                      return bars;
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {campaigns.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">
              キャンペーンがまだ登録されていません。URLを追加してください。
            </p>
          </div>
        )}
      </div>
      
      <CampaignDetailModal
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        onEdit={onEditCampaign}
      />
    </>
  );
}