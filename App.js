import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { theme } from './utils/theme';
import { loadData, saveData } from './storage/db';

import HomeScreen from './screens/HomeScreen';
import BrandsScreen from './screens/BrandsScreen';
import BrandDetailScreen from './screens/BrandDetailScreen';
import ProjectDetailScreen from './screens/ProjectDetailScreen';

import EventFormModal from './components/EventFormModal';
import BrandFormModal from './components/BrandFormModal';
import ProjectFormModal from './components/ProjectFormModal';
import EventDetailModal from './components/EventDetailModal';
import ConfirmModal from './components/ConfirmModal';

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [brands, setBrands] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);

  const [route, setRoute] = useState({ screen: 'home' });

  const [eventForm, setEventForm] = useState(null); // { mode, initial }
  const [brandForm, setBrandForm] = useState(null); // { mode, initial, onSaved }
  const [projectForm, setProjectForm] = useState(null); // { mode, initial, brand, onSaved }
  const [viewEventId, setViewEventId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { title, message, confirmLabel, danger, onConfirm }

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

  // ---------- 일정 ----------
  const openAddEvent = (presetBrandId, presetProjectId) => {
    setEventForm({ mode: 'add', initial: presetBrandId ? { brandId: presetBrandId, projectId: presetProjectId || '' } : null });
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
  const saveBrandForm = (data) => {
    if (data.id) {
      setBrands(prev => prev.map(b => (b.id === data.id ? { ...b, name: data.name, color: data.color } : b)));
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
  const requestDeleteBrand = (brand) => {
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
        setRoute({ screen: 'brands' });
      },
    });
  };

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
      setProjects(prev => prev.map(p => (p.id === data.id ? { ...p, name: data.name, memo: data.memo } : p)));
      projectForm?.onSaved?.(data);
    } else {
      const p = { id: newId('p'), brandId: data.brandId, name: data.name, memo: data.memo, createdAt: Date.now() };
      setProjects(prev => [...prev, p]);
      projectForm?.onSaved?.(p);
    }
    setProjectForm(null);
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
        setRoute({ screen: 'brandDetail', brandId: project.brandId });
      },
    });
  };

  const viewEvent = viewEventId ? enrichedEvents.find(e => e.id === viewEventId) : null;

  let screenNode = null;
  if (!loaded) {
    screenNode = <View style={styles.loading}><Text style={styles.loadingText}>불러오는 중…</Text></View>;
  } else if (route.screen === 'brands') {
    screenNode = (
      <BrandsScreen
        brands={brands} projects={projects} events={events}
        onBack={() => setRoute({ screen: 'home' })}
        onOpenBrand={(id) => setRoute({ screen: 'brandDetail', brandId: id })}
        onEditBrand={openEditBrand}
        onAddBrand={() => openAddBrand()}
      />
    );
  } else if (route.screen === 'brandDetail') {
    const brand = brands.find(b => b.id === route.brandId);
    if (!brand) {
      screenNode = <MissingScreen label="브랜드를 찾을 수 없습니다." onBack={() => setRoute({ screen: 'brands' })} />;
    } else {
      screenNode = (
        <BrandDetailScreen
          brand={brand} projects={projects} events={events}
          onBack={() => setRoute({ screen: 'brands' })}
          onOpenProject={(id) => setRoute({ screen: 'projectDetail', projectId: id })}
          onEditProject={openEditProject}
          onAddProject={() => openAddProject(brand.id)}
          onEditBrand={() => openEditBrand(brand)}
          onDeleteBrand={() => requestDeleteBrand(brand)}
        />
      );
    }
  } else if (route.screen === 'projectDetail') {
    const project = projects.find(p => p.id === route.projectId);
    if (!project) {
      screenNode = <MissingScreen label="프로젝트를 찾을 수 없습니다." onBack={() => setRoute({ screen: 'brands' })} />;
    } else {
      const brand = brands.find(b => b.id === project.brandId);
      screenNode = (
        <ProjectDetailScreen
          project={project} brand={brand} events={events}
          onBack={() => setRoute({ screen: 'brandDetail', brandId: project.brandId })}
          onOpenEvent={setViewEventId}
          onAddEvent={() => openAddEvent(project.brandId, project.id)}
          onEditProject={() => openEditProject(project)}
          onDeleteProject={() => requestDeleteProject(project)}
        />
      );
    }
  } else {
    screenNode = (
      <HomeScreen
        brands={brands} projects={projects} enrichedEvents={enrichedEvents}
        onAddEvent={() => openAddEvent()}
        onOpenEvent={setViewEventId}
        onOpenBrands={() => setRoute({ screen: 'brands' })}
        onOpenBrand={(id) => setRoute({ screen: 'brandDetail', brandId: id })}
        onAddBrandQuick={openAddBrand}
        onAddProjectQuick={openAddProject}
        onExtract={onExtractEvents}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {screenNode}

      <EventFormModal
        visible={!!eventForm}
        mode={eventForm?.mode}
        initial={eventForm?.initial}
        brands={brands}
        projects={projects}
        onSave={saveEventForm}
        onClose={() => setEventForm(null)}
        onAddBrand={openAddBrand}
        onAddProject={openAddProject}
      />

      <BrandFormModal
        visible={!!brandForm}
        mode={brandForm?.mode}
        initial={brandForm?.initial}
        existingBrands={brands}
        onSave={saveBrandForm}
        onClose={() => setBrandForm(null)}
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
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: theme.textSub, fontWeight: '600' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  missingText: { color: theme.textSub, fontWeight: '600', marginBottom: 14 },
  missingBtn: { backgroundColor: theme.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  missingBtnText: { color: '#fff', fontWeight: '700' },
});
