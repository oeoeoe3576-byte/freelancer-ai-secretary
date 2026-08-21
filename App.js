import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const STORAGE_KEY = 'freelancer-secretary-events-v1';
const WEEK = ['일','월','화','수','목','금','토'];

const pad = n => String(n).padStart(2,'0');
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseKey = k => {
  const [y,m,d] = k.split('-').map(Number);
  return new Date(y,m-1,d);
};
const addDays = (d,n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const startOfWeek = d => addDays(d, -d.getDay());
const monthLabel = d => `${d.getFullYear()}년 ${d.getMonth()+1}월`;
const dayLabel = d => `${d.getMonth()+1}월 ${d.getDate()}일 ${WEEK[d.getDay()]}요일`;
const daysBetween = (a,b) => Math.ceil((parseKey(b)-parseKey(a))/86400000);

function extractEvents(text) {
  const lines = text.split(/\n+/).map(s=>s.trim()).filter(Boolean);
  const out = [];
  const today = new Date();
  const year = today.getFullYear();
  const patterns = [
    /(\d{1,2})\s*\/\s*(\d{1,2})/,
    /(\d{1,2})\s*월\s*(\d{1,2})\s*일/,
    /(20\d{2})[.-](\d{1,2})[.-](\d{1,2})/
  ];
  for (const line of lines) {
    let dateKey = null;
    for (const p of patterns) {
      const m = line.match(p);
      if (!m) continue;
      let y,mo,da;
      if (m.length === 4) [_,y,mo,da] = m;
      else { y = year; mo = m[1]; da = m[2]; }
      dateKey = `${y}-${pad(mo)}-${pad(da)}`;
      break;
    }
    if (dateKey) {
      const title = line.replace(/20\d{2}[.-]\d{1,2}[.-]\d{1,2}|\d{1,2}\s*\/\s*\d{1,2}|\d{1,2}\s*월\s*\d{1,2}\s*일/g,'').replace(/^[\s:,-]+|[\s:,-]+$/g,'') || '협찬 일정';
      out.push({ id: `${Date.now()}-${Math.random()}`, title, date: dateKey, type: '협찬', done: false, source: text });
    }
  }
  return out;
}

function App() {
  const [events,setEvents] = useState([]);
  const [view,setView] = useState('month');
  const [cursor,setCursor] = useState(new Date());
  const [selected,setSelected] = useState(new Date());
  const [input,setInput] = useState('');
  const [modal,setModal] = useState(false);
  const [title,setTitle] = useState('');
  const [date,setDate] = useState(keyOf(new Date()));
  const [type,setType] = useState('업무');

  useEffect(()=>{ AsyncStorage.getItem(STORAGE_KEY).then(v=>{ if(v) setEvents(JSON.parse(v)); }).catch(()=>{}); },[]);
  useEffect(()=>{ AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events)).catch(()=>{}); },[events]);

  const grouped = useMemo(()=> events.reduce((a,e)=>((a[e.date] ||= []).push(e),a),{}), [events]);
  const todayKey = keyOf(new Date());
  const upcoming = useMemo(()=>events.filter(e=>!e.done && daysBetween(todayKey,e.date)>=0 && daysBetween(todayKey,e.date)<=3).sort((a,b)=>a.date.localeCompare(b.date)),[events]);
  const todayEvents = grouped[todayKey] || [];

  const addManual = () => {
    if(!title.trim()) return Alert.alert('제목을 입력해주세요.');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Alert.alert('날짜는 YYYY-MM-DD 형식으로 입력해주세요.');
    setEvents(prev=>[...prev,{id:String(Date.now()),title:title.trim(),date,type,done:false}]);
    setTitle(''); setDate(keyOf(new Date())); setModal(false);
  };
  const analyze = () => {
    const found = extractEvents(input);
    if(!found.length) return Alert.alert('날짜를 찾지 못했습니다','예: 8/25 초안 전달, 8월 28일 업로드');
    setEvents(prev=>[...prev,...found]); setInput('');
    Alert.alert('일정 등록 완료', `${found.length}개의 일정을 추가했습니다.`);
  };
  const toggle = id => setEvents(prev=>prev.map(e=>e.id===id?{...e,done:!e.done}:e));
  const remove = id => setEvents(prev=>prev.filter(e=>e.id!==id));

  const move = n => {
    const d = new Date(cursor);
    if(view==='month') d.setMonth(d.getMonth()+n);
    if(view==='week') d.setDate(d.getDate()+7*n);
    if(view==='day') d.setDate(d.getDate()+n);
    setCursor(d); setSelected(d);
  };

  const monthCells = () => {
    const first = new Date(cursor.getFullYear(),cursor.getMonth(),1);
    const start = addDays(first,-first.getDay());
    return Array.from({length:42},(_,i)=>addDays(start,i));
  };
  const weekCells = () => Array.from({length:7},(_,i)=>addDays(startOfWeek(cursor),i));

  const EventPill = ({e}) => (
    <TouchableOpacity onPress={()=>toggle(e.id)} onLongPress={()=>Alert.alert('일정 삭제','이 일정을 삭제할까요?',[{text:'취소'},{text:'삭제',style:'destructive',onPress:()=>remove(e.id)}])} style={[styles.eventPill,e.done&&styles.donePill]}>
      <Text numberOfLines={1} style={[styles.eventText,e.done&&styles.doneText]}>{e.done?'✓ ':''}{e.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.kicker}>FREELANCER SECRETARY</Text>
            <Text style={styles.h1}>프리랜서 AI 비서</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={()=>setModal(true)}><Text style={styles.addBtnText}>+ 일정</Text></TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.card}><Text style={styles.cardNum}>{todayEvents.filter(e=>!e.done).length}</Text><Text style={styles.cardLabel}>오늘 할 일</Text></View>
          <View style={styles.card}><Text style={styles.cardNum}>{upcoming.length}</Text><Text style={styles.cardLabel}>3일 내 마감</Text></View>
          <View style={styles.card}><Text style={styles.cardNum}>{events.filter(e=>!e.done).length}</Text><Text style={styles.cardLabel}>진행 중</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>협찬/업무 내용 붙여넣기</Text>
          <Text style={styles.helper}>메일이나 카톡 내용을 그대로 붙여넣으세요. 날짜가 있는 줄을 일정으로 자동 등록합니다.</Text>
          <TextInput multiline value={input} onChangeText={setInput} placeholder={'예)\n8/25 기획안 전달\n8/28 1차 영상 전달\n8/31 릴스 업로드'} style={styles.textarea} />
          <TouchableOpacity style={styles.primary} onPress={analyze}><Text style={styles.primaryText}>일정 자동 추출</Text></TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={()=>move(-1)} style={styles.nav}><Text>‹</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>{const d=new Date();setCursor(d);setSelected(d);}}><Text style={styles.calendarTitle}>{view==='month'?monthLabel(cursor):dayLabel(cursor)}</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>move(1)} style={styles.nav}><Text>›</Text></TouchableOpacity>
          </View>
          <View style={styles.tabs}>
            {['month','week','day'].map(v=><TouchableOpacity key={v} onPress={()=>setView(v)} style={[styles.tab,view===v&&styles.tabOn]}><Text style={[styles.tabText,view===v&&styles.tabTextOn]}>{v==='month'?'월':v==='week'?'주':'일'}</Text></TouchableOpacity>)}
          </View>

          {view==='month' && <>
            <View style={styles.weekHeader}>{WEEK.map(w=><Text key={w} style={styles.weekHeadText}>{w}</Text>)}</View>
            <View style={styles.monthGrid}>{monthCells().map(d=>{const k=keyOf(d); const active=d.getMonth()===cursor.getMonth(); return <TouchableOpacity key={k} onPress={()=>{setSelected(d);setCursor(d);setView('day');}} style={[styles.dayCell,k===todayKey&&styles.todayCell]}><Text style={[styles.dayNum,!active&&styles.muted]}>{d.getDate()}</Text>{(grouped[k]||[]).slice(0,2).map(e=><EventPill e={e} key={e.id}/>)}{(grouped[k]||[]).length>2&&<Text style={styles.more}>+{(grouped[k]||[]).length-2}</Text>}</TouchableOpacity>})}</View>
          </>}

          {view==='week' && <View>{weekCells().map(d=>{const k=keyOf(d);return <View key={k} style={styles.weekRow}><View style={styles.weekDate}><Text style={styles.weekDay}>{WEEK[d.getDay()]}</Text><Text style={styles.weekDateNum}>{d.getDate()}</Text></View><View style={styles.weekEvents}>{(grouped[k]||[]).length?(grouped[k]||[]).map(e=><EventPill e={e} key={e.id}/>):<Text style={styles.empty}>일정 없음</Text>}</View></View>})}</View>}

          {view==='day' && <View style={styles.dayView}><Text style={styles.dayBig}>{dayLabel(selected)}</Text>{(grouped[keyOf(selected)]||[]).length?(grouped[keyOf(selected)]||[]).map(e=><View key={e.id} style={styles.dayEvent}><TouchableOpacity onPress={()=>toggle(e.id)} style={{flex:1}}><Text style={[styles.dayEventTitle,e.done&&styles.doneText]}>{e.done?'✓ ':''}{e.title}</Text><Text style={styles.dayEventMeta}>{e.type}</Text></TouchableOpacity><TouchableOpacity onPress={()=>remove(e.id)}><Text style={styles.delete}>삭제</Text></TouchableOpacity></View>):<Text style={styles.emptyLarge}>등록된 일정이 없습니다.</Text>}</View>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>마감 임박</Text>
          {upcoming.length?upcoming.map(e=><View key={e.id} style={styles.deadline}><View><Text style={styles.deadlineTitle}>{e.title}</Text><Text style={styles.deadlineDate}>{e.date}</Text></View><Text style={styles.dday}>D-{daysBetween(todayKey,e.date)}</Text></View>):<Text style={styles.emptyLarge}>3일 이내 마감이 없습니다.</Text>}
        </View>
      </ScrollView>

      <Modal visible={modal} animationType="slide" transparent onRequestClose={()=>setModal(false)}>
        <View style={styles.modalWrap}><View style={styles.modalCard}>
          <Text style={styles.modalTitle}>일정 추가</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="일정 제목" style={styles.input}/>
          <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" style={styles.input}/>
          <View style={styles.typeRow}>{['업무','협찬','촬영','업로드'].map(t=><TouchableOpacity key={t} onPress={()=>setType(t)} style={[styles.typeBtn,type===t&&styles.typeOn]}><Text>{t}</Text></TouchableOpacity>)}</View>
          <TouchableOpacity style={styles.primary} onPress={addManual}><Text style={styles.primaryText}>저장</Text></TouchableOpacity>
          <TouchableOpacity style={styles.cancel} onPress={()=>setModal(false)}><Text>취소</Text></TouchableOpacity>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F6F7F9'}, page:{padding:18,paddingBottom:50}, headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16}, kicker:{fontSize:11,letterSpacing:1.4,color:'#697386',fontWeight:'700'}, h1:{fontSize:27,fontWeight:'800',color:'#111827',marginTop:4}, addBtn:{backgroundColor:'#111827',paddingHorizontal:15,paddingVertical:10,borderRadius:12}, addBtnText:{color:'white',fontWeight:'700'}, summaryRow:{flexDirection:'row',gap:8,marginBottom:14}, card:{flex:1,backgroundColor:'white',padding:14,borderRadius:16}, cardNum:{fontSize:24,fontWeight:'800'}, cardLabel:{fontSize:12,color:'#6B7280',marginTop:3}, section:{backgroundColor:'white',padding:16,borderRadius:18,marginBottom:14}, sectionTitle:{fontSize:18,fontWeight:'800',marginBottom:5}, helper:{fontSize:12,color:'#6B7280',lineHeight:18,marginBottom:10}, textarea:{minHeight:120,borderWidth:1,borderColor:'#E5E7EB',borderRadius:14,padding:12,textAlignVertical:'top',fontSize:14}, primary:{backgroundColor:'#111827',padding:14,borderRadius:14,alignItems:'center',marginTop:10}, primaryText:{color:'white',fontWeight:'800'}, calendarHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}, calendarTitle:{fontSize:18,fontWeight:'800'}, nav:{width:40,height:40,borderRadius:12,backgroundColor:'#F3F4F6',alignItems:'center',justifyContent:'center'}, tabs:{flexDirection:'row',backgroundColor:'#F3F4F6',borderRadius:12,padding:4,marginVertical:12}, tab:{flex:1,padding:8,alignItems:'center',borderRadius:9}, tabOn:{backgroundColor:'white'}, tabText:{color:'#6B7280',fontWeight:'700'}, tabTextOn:{color:'#111827'}, weekHeader:{flexDirection:'row'}, weekHeadText:{width:'14.2857%',textAlign:'center',fontSize:11,color:'#6B7280',paddingBottom:7}, monthGrid:{flexDirection:'row',flexWrap:'wrap'}, dayCell:{width:'14.2857%',minHeight:78,borderTopWidth:1,borderColor:'#F0F1F3',padding:4}, todayCell:{backgroundColor:'#F8FAFC'}, dayNum:{fontSize:12,fontWeight:'700'}, muted:{color:'#C6CBD3'}, eventPill:{backgroundColor:'#EEF2F7',borderRadius:6,paddingHorizontal:4,paddingVertical:3,marginTop:3}, donePill:{opacity:.5}, eventText:{fontSize:9,color:'#273244'}, doneText:{textDecorationLine:'line-through',color:'#9CA3AF'}, more:{fontSize:9,color:'#6B7280',marginTop:2}, weekRow:{flexDirection:'row',borderTopWidth:1,borderColor:'#F0F1F3',paddingVertical:10}, weekDate:{width:55,alignItems:'center'}, weekDay:{fontSize:11,color:'#6B7280'}, weekDateNum:{fontSize:20,fontWeight:'800'}, weekEvents:{flex:1,gap:5}, empty:{fontSize:12,color:'#9CA3AF',paddingTop:8}, dayView:{paddingTop:4}, dayBig:{fontSize:20,fontWeight:'800',marginBottom:12}, dayEvent:{flexDirection:'row',alignItems:'center',paddingVertical:14,borderTopWidth:1,borderColor:'#F0F1F3'}, dayEventTitle:{fontSize:15,fontWeight:'700'}, dayEventMeta:{fontSize:12,color:'#6B7280',marginTop:4}, delete:{color:'#DC2626',fontWeight:'700'}, emptyLarge:{color:'#9CA3AF',paddingVertical:18,textAlign:'center'}, deadline:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12,borderTopWidth:1,borderColor:'#F0F1F3'}, deadlineTitle:{fontWeight:'700'}, deadlineDate:{fontSize:12,color:'#6B7280',marginTop:3}, dday:{fontSize:16,fontWeight:'800'}, modalWrap:{flex:1,backgroundColor:'rgba(0,0,0,.35)',justifyContent:'flex-end'}, modalCard:{backgroundColor:'white',padding:20,paddingBottom:Platform.OS==='ios'?38:20,borderTopLeftRadius:24,borderTopRightRadius:24}, modalTitle:{fontSize:22,fontWeight:'800',marginBottom:14}, input:{borderWidth:1,borderColor:'#E5E7EB',borderRadius:12,padding:13,marginBottom:10}, typeRow:{flexDirection:'row',gap:6,flexWrap:'wrap'}, typeBtn:{paddingHorizontal:12,paddingVertical:9,backgroundColor:'#F3F4F6',borderRadius:10}, typeOn:{backgroundColor:'#DCE4EE'}, cancel:{alignItems:'center',padding:14,marginTop:4}
});

export default App;
