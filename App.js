import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { theme } from './utils/theme';
import { loadData, saveData } from './storage/db';
import { keyOf } from './utils/date';

import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import AddScreen from './screens/AddScreen';
import LedgerScreen from './screens/LedgerScreen';
import BrandsScreen from './screens/BrandsScreen';
import BrandDetailScreen from './screens/BrandDetailScreen';
import ProjectDetailScreen from './screens/ProjectDetailScreen';

import TabBar from './components/TabBar';
import EventFormModal from './components/EventFormModal';
import BrandFormModal from './components/BrandFormModal';
import BrandProjectFormModal from './components/BrandProjectFormModal';
import ProjectFormModal from './components/ProjectFormModal';
import EventDetailModal from './components/EventDetailModal';
import ConfirmModal from './components/ConfirmModal';
import MigrationNamePrompt from './components/MigrationNamePrompt';

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [brands, setBrands] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);

  // 하단 탭(홈/일정/추가/가계부/브랜드) + 브랜드-프로젝트 드릴다운 스택(탭과 별개로, 탭바는 계속 보인다)
  const [activeTab, setActiveTab] = useState('home');
  const [drill, setDrill] = useState(null); // null | {screen:'brandDetail', brandId} | {screen:'projectDetail', projectId}

  const [eventForm, setEventForm] = useState(null); // { mode, initial }
  const [brandForm, setBrandForm] = useState(null); // { mode, initial, onSaved }
  const [brandProjectForm, setBrandProjectForm] = useState(null); // { onSaved } - 브랜드+프로젝트 한 번에 추가
  const [projectForm, setProjectForm] = useState(null); // { mode, initial, brand, onSaved }
  const [viewEventId, setViewEventId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { title, message, confirmLabel, danger, onConfirm }
  const [migrationPromptSkipped, setMigrationPromptSkipped] = useState(false);

  // 기존 데이터 불러오기 + 필요 시 v1 -> v2(브랜드/프로젝트 구조) 자동 마이그레이션
  useEffect(() => {
    loadData().then(d => {
      setBrands(d.brands);
      setProjects(d.projects);
      setEvents(d.events);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveData({ brands, projects, events });
  }, [brands, projects, events, loaded]);

  const enrichedEvents = useMemo(() => events.map(e => ({
    ...e,
    brand: brands.find(b => b.id === e.brandId) || null,
    project: projects.find(p => p.id === e.projectId) || null,
  })), [events, brands, projects]);

  // 마이그레이션으로 만들어졌지만 아직 실제 이름을 안 정한 브랜드가 있으면 안내 화면을 띄운다
  const pendingNameBrand = brands.find(b => b.pendingRename) || null;
  const showMigrationPrompt = !!pendingNameBrand && !migrationPromptSkipped;
  const saveMigrationName = (name, color) => {
    setBrands(prev => prev.map(b => (b.id === pendingNameBrand.id ? { ...b, name, color, pendingRename: false } : b)));
  };

  // ---------- 탭/드릴다운 네비게이션 ----------
  const switchTab = (tab) => { setDrill(null); setActiveTab(tab); };
  const openBrands = () => switchTab('brands');
  const openBrandDetail = (brandId) => setDrill({ screen: 'brandDetail', brandId });
  const openProjectDetail = (projectId) => setDrill({ screen: 'projectDetail', projectId });

  // ---------- 일정 ----------
  // opts: { brandId, projectId, date } - 프로젝트 상세/달력의 "일정 추가"처럼 미리 채워서 열 때 쓴다.
  const openAddEvent = (opts) => {
    const { brandId, projectId, date } = opts || {};
    const initial = (brandId || date) ? { brandId: brandId || '', projectId: projectId || '', date } : null;
    setEventForm({ mode: 'add', initial });
  };
  const openEditEvent = (event) => setEventForm({ mode: 'edit', initial: event });
  const saveEventForm = (data) => {
    if (data.id) {
      setEvents(prev => prev.map(e => (e.id === data.id ? { ...e, ...data } : e)));
    } else {
      setEvents(prev => [...prev, { id: newId('e'), done: false, createdAt: Date.now(), ...data }]);
    }
    setEventForm(null);
  };
  const toggleDone = (id) => setEvents(prev => prev.map(e => (e.id === id ? { ...e, done: !e.done } : e)));
  const requestDeleteEvent = (event) => {
    if (!event) return;
    setConfirm({
      title: '이 일정을 삭제하시겠어요?',
      message: null,
      confirmLabel: '삭제',
      danger: true,
      onConfirm: () => {
        setEvents(prev => prev.filter(e => e.id !== event.id));
        setConfirm(null);
        setViewEventId(null);
      },
    });
  };
  const onExtractEvents = (brandId, projectId, list) => {
    const created = list.map(item => ({
      id: newId('ex'),
      brandId, projectId,
      title: item.title, date: item.date, type: item.type,
      done: false, createdAt: Date.now(),
    }));
    setEvents(prev => [...prev, ...created]);
  };

  // ---------- 브랜드 ----------
  const openAddBrand = (onSaved) => setBrandForm({ mode: 'add', initial: null, onSaved });
  const openEditBrand = (brand) => setBrandForm({ mode: 'edit', initial: brand, onSaved: null });
  // 브랜드 선택 화면(일정 추가/일정 폼)에서 "새 브랜드"를 누르면 브랜드+첫 프로젝트를 한 번에 만든다.
  const openAddBrandWithProject = (onSaved) => setBrandProjectForm({ onSaved });
  const saveBrandProjectForm = ({ brandName, color, projectName }) => {
    const b = { id: newId('b'), name: brandName, color, createdAt: Date.now() };
    const p = { id: newId('p'), brandId: b.id, name: projectName, memo: '', amount: null, settled: false, settledAt: null, createdAt: Date.now() };
    setBrands(prev => [...prev, b]);
    setProjects(prev => [...prev, p]);
    brandProjectForm?.onSaved?.(b, p);
    setBrandProjectForm(null);
  };
  // 일정 추가/수정 화면(달력에서 눌러 들어온 흐름 포함)에서 바로 브랜드 색상을 바꿀 수 있게 하는 단축 경로
  const updateBrandColorInline = (brandId, color) => {
    setBrands(prev => prev.map(b => (b.id === brandId ? { ...b, color } : b)));
  };
  const saveBrandForm = (data) => {
    if (data.id) {
      // 어느 경로로 수정하든(마이그레이션 안내 화면 포함) 이름을 정해주면 "이름 미정" 상태는 해제한다
      setBrands(prev => prev.map(b => (b.id === data.id ? { ...b, name: data.name, color: data.color, pendingRename: false } : b)));
      brandForm?.onSaved?.(data);
    } else {
      const b = { id: newId('b'), name: data.name, color: data.color, createdAt: Date.now() };
      setBrands(prev => [...prev, b]);
      brandForm?.onSaved?.(b);
    }
    setBrandForm(null);
  };
  const deleteBrandCascade = (brandId) => {
    setBrands(prev => prev.filter(b => b.id !== brandId));
    setProjects(prev => prev.filter(p => p.brandId !== brandId));
    setEvents(prev => prev.filter(e => e.brandId !== brandId));
  };
  // 브랜드 삭제 확인 공용 로직. navigateAfter: 브랜드 상세 화면에서 삭제할 때만 목록으로 돌아간다
  // (일정 추가 화면의 브랜드 칩에서 바로 지울 때는 화면 이동 없이 그 자리에 머무른다).
  const confirmDeleteBrand = (brand, { navigateAfter = false, onDeleted } = {}) => {
    const projectCount = projects.filter(p => p.brandId === brand.id).length;
    const eventCount = events.filter(e => e.brandId === brand.id).length;
    setConfirm({
      title: '브랜드를 삭제하시겠어요?',
      message: (projectCount || eventCount)
        ? `이 브랜드에 프로젝트 ${projectCount}개, 일정 ${eventCount}개가 있습니다. 함께 삭제됩니다.`
        : null,
      confirmLabel: '삭제',
      danger: true,
      onConfirm: () => {
        deleteBrandCascade(brand.id);
        setConfirm(null);
        if (navigateAfter) setDrill(null);
        onDeleted?.();
      },
    });
  };
  const requestDeleteBrand = (brand) => confirmDeleteBrand(brand, { navigateAfter: true });

  // ---------- 프로젝트 ----------
  const openAddProject = (brandId, onSaved) => {
    const brand = brands.find(b => b.id === brandId);
    setProjectForm({ mode: 'add', initial: null, brand, onSaved });
  };
  const openEditProject = (project) => {
    const brand = brands.find(b => b.id === project.brandId);
    setProjectForm({ mode: 'edit', initial: project, brand, onSaved: null });
  };
  const saveProjectForm = (data) => {
    if (data.id) {
      setProjects(prev => prev.map(p => (p.id === data.id ? { ...p, name: data.name, memo: data.memo, amount: data.amount, dueDate: data.dueDate } : p)));
      projectForm?.onSaved?.(data);
    } else {
      const p = { id: newId('p'), brandId: data.brandId, name: data.name, memo: data.memo, amount: data.amount, dueDate: data.dueDate || null, settled: false, settledAt: null, createdAt: Date.now() };
      setProjects(prev => [...prev, p]);
      projectForm?.onSaved?.(p);
    }
    setProjectForm(null);
  };
  // 가계부: 프로젝트당 금액 1개 기준으로 정산 완료 여부를 토글한다
  const toggleProjectSettled = (project) => {
    setProjects(prev => prev.map(p => (p.id === project.id
      ? { ...p, settled: !p.settled, settledAt: !p.settled ? keyOf(new Date()) : null }
      : p)));
  };
  const requestDeleteProject = (project) => {
    const count = events.filter(e => e.projectId === project.id).length;
    setConfirm({
      title: '프로젝트를 삭제하시겠어요?',
      message: count > 0 ? `이 프로젝트에 일정 ${count}개가 있습니다. 함께 삭제됩니다.` : null,
      confirmLabel: '삭제',
      danger: true,
      onConfirm: () => {
        setProjects(prev => prev.filter(p => p.id !== project.id));
        setEvents(prev => prev.filter(e => e.projectId !== project.id));
        setConfirm(null);
        setDrill({ screen: 'brandDetail', brandId: project.brandId });
      },
    });
  };

  const viewEvent = viewEventId ? enrichedEvents.find(e => e.id === viewEventId) : null;

  let screenNode = null;
  if (!loaded) {
    screenNode = <View style={styles.loading}><Text style={styles.loadingText}>불러오는 중…</Text></View>;
  } else if (drill?.screen === 'brandDetail') {
    const brand = brands.find(b => b.id === drill.brandId);
    if (!brand) {
      screenNode = <MissingScreen label="브랜드를 찾을 수 없습니다." onBack={() => setDrill(null)} />;
    } else {
      screenNode = (
        <BrandDetailScreen
          brand={brand} projects={projects} events={events}
          onBack={() => setDrill(null)}
          onOpenProject={openProjectDetail}
          onEditProject={openEditProject}
          onAddProject={() => openAddProject(brand.id)}
          onEditBrand={() => openEditBrand(brand)}
          onDeleteBrand={() => requestDeleteBrand(brand)}
        />
      );
    }
  } else if (drill?.screen === 'projectDetail') {
    const project = projects.find(p => p.id === drill.projectId);
    if (!project) {
      screenNode = <MissingScreen label="프로젝트를 찾을 수 없습니다." onBack={() => setDrill(null)} />;
    } else {
      const brand = brands.find(b => b.id === project.brandId);
      screenNode = (
        <ProjectDetailScreen
          project={project} brand={brand} events={events}
          onBack={() => setDrill({ screen: 'brandDetail', brandId: project.brandId })}
          onOpenEvent={setViewEventId}
          onAddEvent={() => openAddEvent({ brandId: project.brandId, projectId: project.id })}
          onEditProject={() => openEditProject(project)}
          onDeleteProject={() => requestDeleteProject(project)}
          onToggleSettled={() => toggleProjectSettled(project)}
        />
      );
    }
  } else if (activeTab === 'calendar') {
    screenNode = (
      <CalendarScreen
        enrichedEvents={enrichedEvents}
        onOpenEvent={setViewEventId}
        onAddEvent={(date) => openAddEvent({ date })}
      />
    );
  } else if (activeTab === 'add') {
    screenNode = (
      <AddScreen
        brands={brands} projects={projects}
        onAddBrand={openAddBrandWithProject}
        onAddProject={openAddProject}
        onDeleteBrand={(brand, onDeleted) => confirmDeleteBrand(brand, { onDeleted })}
        onCreateEvent={saveEventForm}
        onExtract={onExtractEvents}
      />
    );
  } else if (activeTab === 'ledger') {
    screenNode = (
      <LedgerScreen
        projects={projects} brands={brands}
        onOpenProject={openProjectDetail}
        onOpenBrands={openBrands}
      />
    );
  } else if (activeTab === 'brands') {
    screenNode = (
      <BrandsScreen
        brands={brands} projects={projects} events={events}
        onOpenBrand={openBrandDetail}
        onEditBrand={openEditBrand}
        onAddBrand={() => openAddBrand()}
      />
    );
  } else {
    screenNode = (
      <HomeScreen
        brands={brands} projects={projects} enrichedEvents={enrichedEvents}
        onOpenEvent={setViewEventId}
        onOpenBrands={openBrands}
        onOpenBrand={openBrandDetail}
        onAddBrandQuick={openAddBrand}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.body}>{screenNode}</View>
      {loaded && <TabBar active={activeTab} onChange={switchTab} />}

      <EventFormModal
        visible={!!eventForm}
        mode={eventForm?.mode}
        initial={eventForm?.initial}
        brands={brands}
        projects={projects}
        onSave={saveEventForm}
        onClose={() => setEventForm(null)}
        onAddBrand={openAddBrandWithProject}
        onAddProject={openAddProject}
        onDeleteBrand={(brand, onDeleted) => confirmDeleteBrand(brand, { onDeleted })}
        onChangeBrandColor={updateBrandColorInline}
      />

      <BrandFormModal
        visible={!!brandForm}
        mode={brandForm?.mode}
        initial={brandForm?.initial}
        existingBrands={brands}
        onSave={saveBrandForm}
        onClose={() => setBrandForm(null)}
      />

      <BrandProjectFormModal
        visible={!!brandProjectForm}
        existingBrands={brands}
        onSave={saveBrandProjectForm}
        onClose={() => setBrandProjectForm(null)}
      />

      <ProjectFormModal
        visible={!!projectForm}
        mode={projectForm?.mode}
        initial={projectForm?.initial}
        brand={projectForm?.brand}
        onSave={saveProjectForm}
        onClose={() => setProjectForm(null)}
      />

      <EventDetailModal
        visible={!!viewEvent}
        event={viewEvent}
        brand={viewEvent?.brand}
        project={viewEvent?.project}
        onClose={() => setViewEventId(null)}
        onToggleDone={() => toggleDone(viewEvent.id)}
        onEdit={() => { const ev = viewEvent; setViewEventId(null); openEditEvent(ev); }}
        onDelete={() => requestDeleteEvent(viewEvent)}
      />

      <MigrationNamePrompt
        visible={showMigrationPrompt}
        brand={pendingNameBrand}
        eventCount={pendingNameBrand ? events.filter(e => e.brandId === pendingNameBrand.id).length : 0}
        onSave={saveMigrationName}
        onSkip={() => setMigrationPromptSkipped(true)}
      />

      <ConfirmModal
        visible={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        danger={confirm?.danger}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />
    </SafeAreaView>
  );
}

function MissingScreen({ label, onBack }) {
  return (
    <View style={styles.missing}>
      <Text style={styles.missingText}>{label}</Text>
      <TouchableOpacity style={styles.missingBtn} onPress={onBack}><Text style={styles.missingBtnText}>돌아가기</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  body: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: theme.textSub, fontWeight: '600' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  missingText: { color: theme.textSub, fontWeight: '600', marginBottom: 14 },
  missingBtn: { backgroundColor: theme.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  missingBtnText: { color: '#fff', fontWeight: '700' },
});
