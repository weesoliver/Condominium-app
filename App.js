import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIAS = [
  'Condomínio mensal', 'Luz', 'Água', 'Limpeza', 'Segurança', 'Manutenção',
  'Jardinagem', 'Elevador', 'Pintura', 'Taxas', 'Outros'
];

// Funções para salvar e carregar dados localmente
const salvarLancamentos = async (lancamentos) => {
  try {
    const jsonValue = JSON.stringify(lancamentos);
    await AsyncStorage.setItem('lancamentos', jsonValue);
    console.log('Lançamentos salvos:', lancamentos.length);
  } catch (error) {
    console.error('Erro ao salvar lançamentos:', error);
    Alert.alert('Erro', 'Não foi possível salvar os lançamentos');
  }
};

const carregarLancamentos = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('lancamentos');
    const dados = jsonValue ? JSON.parse(jsonValue) : [];
    console.log('Lançamentos carregados:', dados.length);
    return dados;
  } catch (error) {
    console.error('Erro ao carregar lançamentos:', error);
    return [];
  }
};

const salvarMoradores = async (moradores) => {
  try {
    const jsonValue = JSON.stringify(moradores);
    await AsyncStorage.setItem('moradores', jsonValue);
    console.log('Moradores salvos:', moradores.length);
  } catch (error) {
    console.error('Erro ao salvar moradores:', error);
    Alert.alert('Erro', 'Não foi possível salvar os moradores');
  }
};

const carregarMoradores = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('moradores');
    const dados = jsonValue ? JSON.parse(jsonValue) : [];
    console.log('Moradores carregados:', dados.length);
    return dados;
  } catch (error) {
    console.error('Erro ao carregar moradores:', error);
    return [];
  }
};

const App = () => {
  const [tela, setTela] = useState('splash');
  const [lancamentos, setLancamentos] = useState([]);
  const [moradores, setMoradores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMoradorModal, setShowMoradorModal] = useState(false);
  const [editandoMorador, setEditandoMorador] = useState(null);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [mesSelecionadoResumo, setMesSelecionadoResumo] = useState(null);
  const [novoLancamento, setNovoLancamento] = useState({
    descricao: '',
    valor: '',
    categoria: 'Condomínio mensal',
    dia: new Date().getDate().toString().padStart(2, '0'),
    mes: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    ano: new Date().getFullYear().toString(),
    moradorId: '',
  });
  const [novoMorador, setNovoMorador] = useState({
    nome: '',
    apto: '',
    telefone: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => setTela('principal'), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const lancamentosCarregados = await carregarLancamentos();
    const moradoresCarregados = await carregarMoradores();
    
    if (lancamentosCarregados.length > 0) {
      setLancamentos(lancamentosCarregados);
    } else {
      const dadosIniciais = [
        { id: '1', descricao: 'Taxa de condomínio', valor: 1200, categoria: 'Taxas', data: '2025-01-15T10:30' },
        { id: '2', descricao: 'Conta de luz', valor: -450, categoria: 'Luz', data: '2025-01-10T14:20' },
        { id: '3', descricao: 'Serviço de limpeza', valor: -300, categoria: 'Limpeza', data: '2025-01-05T09:00' },
        { id: '4', descricao: 'Taxa de condomínio', valor: 2200, categoria: 'Taxas', data: '2025-02-15T10:30' },
        { id: '5', descricao: 'Manutenção de elevador', valor: -800, categoria: 'Elevador', data: '2025-02-20T16:00' },
        { id: '6', descricao: 'Taxa de condomínio', valor: 2800, categoria: 'Taxas', data: '2025-03-15T10:30' },
      ];
      setLancamentos(dadosIniciais);
      salvarLancamentos(dadosIniciais);
    }

    if (moradoresCarregados.length > 0) {
      setMoradores(moradoresCarregados);
    } else {
      const moradoresIniciais = [
        { id: '1', nome: 'João Silva', apto: '101', telefone: '(11) 98765-4321' },
        { id: '2', nome: 'Maria Santos', apto: '102', telefone: '(11) 98765-4322' },
        { id: '3', nome: 'Pedro Oliveira', apto: '201', telefone: '(11) 98765-4323' },
      ];
      setMoradores(moradoresIniciais);
      salvarMoradores(moradoresIniciais);
    }
  };

  const adicionarLancamento = async () => {
    if (!novoLancamento.descricao || !novoLancamento.valor) {
      Alert.alert('Atenção', 'Preencha a descrição e o valor');
      return;
    }
    // Validação: se for Condomínio mensal com valor positivo, precisa selecionar morador
    if (novoLancamento.categoria === 'Condomínio mensal' && parseFloat(novoLancamento.valor) > 0 && !novoLancamento.moradorId) {
      Alert.alert('Atenção', 'Selecione o morador que efetuou o pagamento');
      return;
    }
    
    try {
      const valor = parseFloat(novoLancamento.valor);
      const dataISO = `${novoLancamento.ano}-${novoLancamento.mes}-${novoLancamento.dia}T12:00:00`;
      
      const novo = {
        id: Date.now().toString(),
        descricao: novoLancamento.descricao,
        valor: valor,
        categoria: novoLancamento.categoria,
        data: dataISO,
        moradorId: novoLancamento.moradorId || null,
      };
      
      const novosLancamentos = [...lancamentos, novo];
      setLancamentos(novosLancamentos);
      await salvarLancamentos(novosLancamentos);
      
      console.log('Lançamento adicionado:', novo);
      
      setShowModal(false);
      const hoje = new Date();
      setNovoLancamento({ 
        descricao: '', 
        valor: '', 
        categoria: 'Condomínio mensal',
        dia: hoje.getDate().toString().padStart(2, '0'),
        mes: (hoje.getMonth() + 1).toString().padStart(2, '0'),
        ano: hoje.getFullYear().toString(),
        moradorId: '',
      });
    } catch (error) {
      console.error('Erro ao adicionar lançamento:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o lançamento');
    }
  };

  const adicionarOuEditarMorador = async () => {
    if (!novoMorador.nome || !novoMorador.apto) return;
    
    let novosMoradores;
    if (editandoMorador) {
      novosMoradores = moradores.map(m => 
        m.id === editandoMorador ? { ...m, ...novoMorador } : m
      );
    } else {
      const novo = {
        id: Date.now().toString(),
        ...novoMorador
      };
      novosMoradores = [...moradores, novo];
    }
    
    setMoradores(novosMoradores);
    await salvarMoradores(novosMoradores);
    
    setShowMoradorModal(false);
    setEditandoMorador(null);
    setNovoMorador({ nome: '', apto: '', telefone: '' });
  };

  const editarMorador = (morador) => {
    setEditandoMorador(morador.id);
    setNovoMorador({ nome: morador.nome, apto: morador.apto, telefone: morador.telefone });
    setShowMoradorModal(true);
  };

  const removerMorador = async (id) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja remover este morador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const novosMoradores = moradores.filter(m => m.id !== id);
            setMoradores(novosMoradores);
            await salvarMoradores(novosMoradores);
          }
        }
      ]
    );
  };

  const removerLancamento = async (id) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja remover este lançamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const novosLancamentos = lancamentos.filter(l => l.id !== id);
            setLancamentos(novosLancamentos);
            await salvarLancamentos(novosLancamentos);
          }
        }
      ]
    );
  };

  const calcularSaldoMes = (mes, ano) => {
    return lancamentos
      .filter(l => {
        const data = new Date(l.data);
        return data.getMonth() === mes && data.getFullYear() === ano;
      })
      .reduce((acc, l) => acc + l.valor, 0);
  };

  const obterLancamentosMes = (mes, ano) => {
    return lancamentos
      .filter(l => {
        const data = new Date(l.data);
        return data.getMonth() === mes && data.getFullYear() === ano;
      })
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  const obterResumoMeses = () => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const resumo = [];
    const hoje = new Date();
    for (let i = 2; i >= 0; i--) {
      const mes = hoje.getMonth() - i;
      const ano = hoje.getFullYear();
      const mesAjustado = mes < 0 ? 12 + mes : mes;
      const anoAjustado = mes < 0 ? ano - 1 : ano;
      resumo.push({
        nome: `${meses[mesAjustado]} de ${anoAjustado}`,
        mes: mesAjustado,
        ano: anoAjustado,
        saldo: calcularSaldoMes(mesAjustado, anoAjustado)
      });
    }
    return resumo;
  };

  const obterAtividadesRecentes = () => {
    return [...lancamentos].sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(valor));
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getDespesasPorCategoria = (mes, ano) => {
    const despesas = lancamentos.filter(l => {
      const data = new Date(l.data);
      return l.valor < 0 && data.getMonth() === mes && data.getFullYear() === ano;
    });
    const porCategoria = {};
    despesas.forEach(d => {
      porCategoria[d.categoria] = (porCategoria[d.categoria] || 0) + Math.abs(d.valor);
    });
    return Object.entries(porCategoria).map(([cat, val]) => ({ categoria: cat, valor: val }));
  };

  const getDespesasPorMes = () => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses.map((mes, idx) => ({
      mes,
      valor: Math.abs(lancamentos.filter(l => {
        const data = new Date(l.data);
        return data.getMonth() === idx && l.valor < 0;
      }).reduce((acc, l) => acc + l.valor, 0))
    }));
  };

  const obterMoradoresInadimplentes = (mes, ano) => {
    const pagamentos = lancamentos.filter(l => {
      const data = new Date(l.data);
      return l.categoria === 'Condomínio mensal' && 
             l.valor > 0 && 
             data.getMonth() === mes && 
             data.getFullYear() === ano &&
             l.moradorId;
    });

    const moradoresPagaram = new Set(pagamentos.map(p => p.moradorId));
    
    return moradores.filter(m => !moradoresPagaram.has(m.id));
  };

  const obterNomeMorador = (moradorId) => {
    const morador = moradores.find(m => m.id === moradorId);
    return morador ? `${morador.nome} (Apto ${morador.apto})` : '';
  };
  if (tela === 'splash') {
    return (
      <View style={styles.splash}>
        <StatusBar barStyle="light-content" backgroundColor="#7c3aed" />
        <View style={styles.splashIcon}>
          <Text style={styles.splashIconText}>🏢</Text>
        </View>
        <Text style={styles.splashTitle}>Condominium</Text>
        <Text style={styles.splashSubtitle}>Seu condomínio saudável</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7c3aed" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🏢</Text>
          </View>
          <Text style={styles.headerTitle}>Condominium</Text>
        </View>
        {tela === 'principal' && (
          <View style={styles.headerInfo}>
            <Text style={styles.headerGreeting}>Olá, Síndico!</Text>
            <Text style={styles.headerDate}>
              Hoje é {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
        )}
        {tela === 'dashboard' && <Text style={styles.headerGreeting}>Dashboard</Text>}
        {tela === 'moradores' && <Text style={styles.headerGreeting}>Moradores</Text>}
        {tela === 'pagamentos' && <Text style={styles.headerGreeting}>Controle de Pagamentos</Text>}
      </View>

      <View style={styles.navigation}>
        <TouchableOpacity style={[styles.navButton, tela === 'principal' && styles.navButtonActive]} onPress={() => setTela('principal')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, tela === 'principal' && styles.navLabelActive]}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, tela === 'moradores' && styles.navButtonActive]} onPress={() => setTela('moradores')}>
          <Text style={styles.navIcon}>👥</Text>
          <Text style={[styles.navLabel, tela === 'moradores' && styles.navLabelActive]}>Moradores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, tela === 'dashboard' && styles.navButtonActive]} onPress={() => setTela('dashboard')}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={[styles.navLabel, tela === 'dashboard' && styles.navLabelActive]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, tela === 'pagamentos' && styles.navButtonActive]} onPress={() => setTela('pagamentos')}>
          <Text style={styles.navIcon}>💰</Text>
          <Text style={[styles.navLabel, tela === 'pagamentos' && styles.navLabelActive]}>Pagamentos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {tela === 'principal' && (
          <View style={styles.mainContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Resumo dos meses</Text>
              {obterResumoMeses().map((mesInfo, idx) => (
                <View key={idx}>
                  <TouchableOpacity style={styles.resumoItem} onPress={() => setMesSelecionadoResumo(mesSelecionadoResumo?.nome === mesInfo.nome ? null : mesInfo)}>
                    <Text style={styles.resumoMes}>{mesInfo.nome}</Text>
                    <View style={styles.resumoSaldo}>
                      <Text style={styles.resumoLabel}>Valor final</Text>
                      <Text style={[styles.resumoValor, mesInfo.saldo >= 0 ? styles.valorPositivo : styles.valorNegativo]}>
                        {formatarValor(mesInfo.saldo)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {mesSelecionadoResumo?.nome === mesInfo.nome && (
                    <View style={styles.lancamentosExpandidos}>
                      {obterLancamentosMes(mesInfo.mes, mesInfo.ano).map(lanc => (
                        <View key={lanc.id} style={styles.lancamentoItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.lancamentoDesc}>{lanc.descricao}</Text>
                            <Text style={styles.lancamentoInfo}>
                              {lanc.categoria} • {formatarData(lanc.data)}
                              {lanc.moradorId && ` • ${obterNomeMorador(lanc.moradorId)}`}
                            </Text>
                          </View>
                          <Text style={[styles.lancamentoValor, lanc.valor >= 0 ? styles.valorPositivo : styles.valorNegativo]}>
                            {lanc.valor >= 0 ? '+' : ''}{formatarValor(lanc.valor)}
                          </Text>
                          <TouchableOpacity onPress={() => removerLancamento(lanc.id)} style={styles.deleteLancButton}>
                            <Text style={styles.deleteLancIcon}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Atividade recente</Text>
              <ScrollView style={styles.atividadesScroll} nestedScrollEnabled={true}>
                {obterAtividadesRecentes().map(ativ => (
                  <View key={ativ.id} style={styles.atividadeItem}>
                    <View style={[styles.atividadeIcon, ativ.valor >= 0 ? styles.iconPositivo : styles.iconNegativo]}>
                      <Text>{ativ.valor >= 0 ? '↑' : '↓'}</Text>
                    </View>
                    <View style={styles.atividadeInfo}>
                      <Text style={styles.atividadeDesc}>{ativ.descricao}</Text>
                      <Text style={styles.atividadeData}>
                        {formatarData(ativ.data)}
                        {ativ.moradorId && ` • ${obterNomeMorador(ativ.moradorId)}`}
                      </Text>
                    </View>
                    <Text style={[styles.atividadeValor, ativ.valor >= 0 ? styles.valorPositivo : styles.valorNegativo]}>
                      {formatarValor(ativ.valor)}
                    </Text>
                    <TouchableOpacity onPress={() => removerLancamento(ativ.id)} style={styles.deleteLancButtonSmall}>
                      <Text style={styles.deleteLancIconSmall}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                {obterAtividadesRecentes().length === 0 && (
                  <Text style={styles.emptyText}>Nenhuma atividade registrada</Text>
                )}
              </ScrollView>
            </View>
          </View>
        )}

        {tela === 'moradores' && (
          <View style={styles.mainContent}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Lista de Moradores</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => {
                  setEditandoMorador(null);
                  setNovoMorador({ nome: '', apto: '', telefone: '' });
                  setShowMoradorModal(true);
                }}>
                  <Text style={styles.addButtonText}>+ Adicionar</Text>
                </TouchableOpacity>
              </View>
              {moradores.sort((a, b) => a.apto.localeCompare(b.apto, undefined, { numeric: true })).map(morador => (
                <View key={morador.id} style={styles.moradorItem}>
                  <View style={styles.moradorIcon}>
                    <Text style={styles.moradorApto}>{morador.apto}</Text>
                  </View>
                  <View style={styles.moradorInfo}>
                    <Text style={styles.moradorNome}>{morador.nome}</Text>
                    <Text style={styles.moradorDetalhe}>Apartamento {morador.apto}</Text>
                    {morador.telefone && <Text style={styles.moradorTelefone}>{morador.telefone}</Text>}
                  </View>
                  <View style={styles.moradorActions}>
                    <TouchableOpacity onPress={() => editarMorador(morador)} style={styles.actionButton}>
                      <Text>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removerMorador(morador.id)} style={styles.actionButton}>
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {tela === 'dashboard' && (
          <View style={styles.mainContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Despesas por mês (2025)</Text>
              <View style={styles.chartContainer}>
                {getDespesasPorMes().map((item, idx) => {
                  const maxVal = Math.max(...getDespesasPorMes().map(i => i.valor), 1);
                  const altura = (item.valor / maxVal) * 140;
                  const valorSemCifrao = formatarValor(item.valor).replace('R$', '').trim();
                  return (
                    <View key={idx} style={styles.barItem}>
                      <View style={styles.barValueContainer}>
                        {item.valor > 0 && (
                          <Text style={styles.barValue}>
                            {valorSemCifrao.split('').join('\n')}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.bar, { height: Math.max(altura, 5) }]} />
                      <Text style={styles.barLabel}>{item.mes}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Despesas por categoria</Text>
              
              <View style={styles.filterContainer}>
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Mês:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mes, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.filterChip, mesSelecionado === idx && styles.filterChipActive]}
                        onPress={() => setMesSelecionado(idx)}
                      >
                        <Text style={[styles.filterChipText, mesSelecionado === idx && styles.filterChipTextActive]}>{mes}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Ano:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {[2023, 2024, 2025, 2026].map((ano) => (
                      <TouchableOpacity
                        key={ano}
                        style={[styles.filterChip, anoSelecionado === ano && styles.filterChipActive]}
                        onPress={() => setAnoSelecionado(ano)}
                      >
                        <Text style={[styles.filterChipText, anoSelecionado === ano && styles.filterChipTextActive]}>{ano}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <View style={styles.categoryList}>
                {getDespesasPorCategoria(mesSelecionado, anoSelecionado).length > 0 ? (
                  getDespesasPorCategoria(mesSelecionado, anoSelecionado).map((item, idx) => {
                    const dados = getDespesasPorCategoria(mesSelecionado, anoSelecionado);
                    const total = dados.reduce((acc, i) => acc + i.valor, 0);
                    const percentual = total > 0 ? ((item.valor / total) * 100).toFixed(1) : 0;
                    const cores = ['#9333ea', '#22c55e', '#3b82f6', '#f97316', '#ef4444'];
                    return (
                      <View key={idx} style={styles.categoryItem}>
                        <View style={[styles.categoryDot, { backgroundColor: cores[idx % cores.length] }]} />
                        <Text style={styles.categoryName}>{item.categoria}</Text>
                        <Text style={styles.categoryPercent}>{percentual}%</Text>
                        <Text style={styles.categoryValue}>{formatarValor(item.valor)}</Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.emptyText}>Nenhuma despesa neste período</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {tela === 'pagamentos' && (
          <View style={styles.mainContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Status de Pagamentos</Text>
              
              <View style={styles.filterContainer}>
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Mês:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mes, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.filterChip, mesSelecionado === idx && styles.filterChipActive]}
                        onPress={() => setMesSelecionado(idx)}
                      >
                        <Text style={[styles.filterChipText, mesSelecionado === idx && styles.filterChipTextActive]}>{mes}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Ano:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {[2023, 2024, 2025, 2026].map((ano) => (
                      <TouchableOpacity
                        key={ano}
                        style={[styles.filterChip, anoSelecionado === ano && styles.filterChipActive]}
                        onPress={() => setAnoSelecionado(ano)}
                      >
                        <Text style={[styles.filterChipText, anoSelecionado === ano && styles.filterChipTextActive]}>{ano}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.statusContainer}>
                <View style={styles.statusCard}>
                  <Text style={styles.statusNumber}>{moradores.length - obterMoradoresInadimplentes(mesSelecionado, anoSelecionado).length}</Text>
                  <Text style={styles.statusLabel}>Pagos</Text>
                  <View style={[styles.statusBar, { backgroundColor: '#22c55e' }]} />
                </View>
                <View style={styles.statusCard}>
                  <Text style={[styles.statusNumber, { color: '#ef4444' }]}>{obterMoradoresInadimplentes(mesSelecionado, anoSelecionado).length}</Text>
                  <Text style={styles.statusLabel}>Pendentes</Text>
                  <View style={[styles.statusBar, { backgroundColor: '#ef4444' }]} />
                </View>
              </View>

              {obterMoradoresInadimplentes(mesSelecionado, anoSelecionado).length > 0 ? (
                <>
                  <Text style={styles.inadimplentesTitulo}>Moradores com pagamento pendente:</Text>
                  {obterMoradoresInadimplentes(mesSelecionado, anoSelecionado).map(morador => (
                    <View key={morador.id} style={styles.inadimplenteItem}>
                      <View style={styles.inadimplenteIcon}>
                        <Text style={styles.inadimplenteApto}>{morador.apto}</Text>
                      </View>
                      <View style={styles.inadimplenteInfo}>
                        <Text style={styles.inadimplenteNome}>{morador.nome}</Text>
                        <Text style={styles.inadimplenteDetalhe}>Apartamento {morador.apto}</Text>
                      </View>
                      <View style={styles.inadimplenteStatus}>
                        <Text style={styles.inadimplenteStatusText}>⚠️ Pendente</Text>
                      </View>
                    </View>
                  ))}
                </>
              ) : (
                <View style={styles.todosEmDia}>
                  <Text style={styles.todosEmDiaIcon}>✅</Text>
                  <Text style={styles.todosEmDiaText}>Todos os moradores estão em dia!</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar item</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput style={styles.input} value={novoLancamento.descricao} onChangeText={(text) => setNovoLancamento({ ...novoLancamento, descricao: text })} placeholder="Ex: Conta de luz" />
              
              <Text style={styles.inputLabel}>Valor (negativo para despesa)</Text>
              <TextInput style={styles.input} value={novoLancamento.valor} onChangeText={(text) => setNovoLancamento({ ...novoLancamento, valor: text })} placeholder="0.00" keyboardType="numeric" />
              
              <Text style={styles.inputLabel}>Data do lançamento</Text>
              <View style={styles.dateInputContainer}>
                <TextInput 
                  style={[styles.input, styles.dateInput]} 
                  value={novoLancamento.dia} 
                  onChangeText={(text) => {
                    if (text.length <= 2 && /^\d*$/.test(text)) {
                      const dia = parseInt(text) || 0;
                      if (dia <= 31) setNovoLancamento({ ...novoLancamento, dia: text });
                    }
                  }} 
                  placeholder="DD" 
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput 
                  style={[styles.input, styles.dateInput]} 
                  value={novoLancamento.mes} 
                  onChangeText={(text) => {
                    if (text.length <= 2 && /^\d*$/.test(text)) {
                      const mes = parseInt(text) || 0;
                      if (mes <= 12) setNovoLancamento({ ...novoLancamento, mes: text });
                    }
                  }} 
                  placeholder="MM" 
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput 
                  style={[styles.input, styles.dateInputYear]} 
                  value={novoLancamento.ano} 
                  onChangeText={(text) => {
                    if (text.length <= 4 && /^\d*$/.test(text)) {
                      setNovoLancamento({ ...novoLancamento, ano: text });
                    }
                  }} 
                  placeholder="AAAA" 
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
              
              <Text style={styles.inputLabel}>Categoria</Text>
              <View style={styles.categoriesGrid}>
                {CATEGORIAS.map(cat => (
                  <TouchableOpacity key={cat} style={[styles.categoryChip, novoLancamento.categoria === cat && styles.categoryChipActive]} onPress={() => setNovoLancamento({ ...novoLancamento, categoria: cat })}>
                    <Text style={[styles.categoryChipText, novoLancamento.categoria === cat && styles.categoryChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Seletor de Morador - aparece apenas para Condomínio mensal com valor positivo */}
              {novoLancamento.categoria === 'Condomínio mensal' && parseFloat(novoLancamento.valor) > 0 && (
                <View style={styles.moradorSelector}>
                  <Text style={styles.selectorTitle}>👤 Selecione o morador que pagou</Text>
                  <ScrollView style={styles.moradoresScroll} nestedScrollEnabled={true}>
                    {moradores.sort((a, b) => a.apto.localeCompare(b.apto, undefined, { numeric: true })).map(morador => (
                      <TouchableOpacity
                        key={morador.id}
                        style={[
                          styles.moradorChip,
                          novoLancamento.moradorId === morador.id && styles.moradorChipActive
                        ]}
                        onPress={() => setNovoLancamento({ ...novoLancamento, moradorId: morador.id })}
                      >
                        <Text style={[
                          styles.moradorChipText,
                          novoLancamento.moradorId === morador.id && styles.moradorChipTextActive
                        ]}>
                          Apto {morador.apto} - {morador.nome}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {!novoLancamento.moradorId && (
                    <View style={styles.alertBox}>
                      <Text style={styles.alertText}>⚠️ Selecione um morador para continuar</Text>
                    </View>
                  )}
                </View>
              )}
              <TouchableOpacity style={styles.submitButton} onPress={adicionarLancamento}>
                <Text style={styles.submitButtonText}>Adicionar lançamento</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showMoradorModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editandoMorador ? 'Editar' : 'Adicionar'} Morador</Text>
              <TouchableOpacity onPress={() => { setShowMoradorModal(false); setEditandoMorador(null); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Nome completo</Text>
            <TextInput style={styles.input} value={novoMorador.nome} onChangeText={(text) => setNovoMorador({ ...novoMorador, nome: text })} placeholder="Ex: João Silva" />
            <Text style={styles.inputLabel}>Número do apartamento</Text>
            <TextInput style={styles.input} value={novoMorador.apto} onChangeText={(text) => setNovoMorador({ ...novoMorador, apto: text })} placeholder="Ex: 101" />
            <Text style={styles.inputLabel}>Telefone (opcional)</Text>
            <TextInput style={styles.input} value={novoMorador.telefone} onChangeText={(text) => setNovoMorador({ ...novoMorador, telefone: text })} placeholder="(11) 98765-4321" keyboardType="phone-pad" />
            <TouchableOpacity style={styles.submitButton} onPress={adicionarOuEditarMorador}>
              <Text style={styles.submitButtonText}>{editandoMorador ? 'Salvar alterações' : 'Adicionar morador'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  splash: { flex: 1, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' },
  splashIcon: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#22d3ee', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  splashIconText: { fontSize: 80 },
  splashTitle: { fontSize: 48, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  splashSubtitle: { fontSize: 18, color: '#a5f3fc' },
  header: { backgroundColor: '#7c3aed', padding: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerIconText: { fontSize: 24 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerInfo: { marginTop: 8 },
  headerGreeting: { fontSize: 18, color: '#fff', marginBottom: 4 },
  headerDate: { fontSize: 14, color: '#e9d5ff' },
  navigation: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 8 },
  navButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 8, marginHorizontal: 4 },
  navButtonActive: { backgroundColor: '#f3e8ff' },
  navIcon: { fontSize: 24, marginBottom: 4 },
  navLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  navLabelActive: { color: '#7c3aed', fontWeight: '600' },
  content: { flex: 1 },
  mainContent: { padding: 16, paddingBottom: 80 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#581c87', marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addButton: { backgroundColor: '#7c3aed', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  resumoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  resumoMes: { fontSize: 16, fontWeight: '500', color: '#374151' },
  resumoSaldo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resumoLabel: { fontSize: 12, color: '#6b7280' },
  resumoValor: { fontSize: 16, fontWeight: 'bold' },
  valorPositivo: { color: '#16a34a' },
  valorNegativo: { color: '#dc2626' },
  lancamentosExpandidos: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 12, marginTop: 8, marginBottom: 12 },
  lancamentoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  lancamentoDesc: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
  lancamentoInfo: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  lancamentoValor: { fontSize: 14, fontWeight: 'bold', marginRight: 8 },
  deleteLancButton: { padding: 4 },
  deleteLancIcon: { fontSize: 16 },
  deleteLancButtonSmall: { padding: 4, marginLeft: 8 },
  deleteLancIconSmall: { fontSize: 14 },
  atividadesScroll: { maxHeight: 400 },
  atividadeItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  atividadeIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconPositivo: { backgroundColor: '#dcfce7' },
  iconNegativo: { backgroundColor: '#fee2e2' },
  atividadeInfo: { flex: 1 },
  atividadeDesc: { fontSize: 16, fontWeight: '500', color: '#111827' },
  atividadeData: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  atividadeValor: { fontSize: 16, fontWeight: 'bold' },
  moradorItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  moradorIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3e8ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  moradorApto: { fontSize: 14, fontWeight: 'bold', color: '#7c3aed' },
  moradorInfo: { flex: 1 },
  moradorNome: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  moradorDetalhe: { fontSize: 14, color: '#4b5563' },
  moradorTelefone: { fontSize: 12, color: '#6b7280' },
  moradorActions: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 8 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 240, paddingTop: 10 },
  barItem: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barValueContainer: { height: 60, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 4 },
  barValue: { fontSize: 10, fontWeight: 'bold', color: '#7c3aed', textAlign: 'center', lineHeight: 12 },
  bar: { width: '70%', backgroundColor: '#7c3aed', borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 5 },
  barLabel: { fontSize: 10, color: '#4b5563', fontWeight: '500', marginTop: 6 },
  categoryList: { gap: 12 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  categoryDot: { width: 16, height: 16, borderRadius: 8 },
  categoryName: { flex: 1, fontSize: 14, fontWeight: '500', color: '#374151' },
  categoryPercent: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  categoryValue: { fontSize: 14, color: '#6b7280' },
  filterContainer: { marginBottom: 16 },
  filterGroup: { marginBottom: 12 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  filterScroll: { flexDirection: 'row' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff', marginRight: 8 },
  filterChipActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  filterChipText: { fontSize: 14, color: '#374151' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#6b7280', fontSize: 14, paddingVertical: 20 },
  statusContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statusCard: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, alignItems: 'center' },
  statusNumber: { fontSize: 32, fontWeight: 'bold', color: '#22c55e', marginBottom: 4 },
  statusLabel: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  statusBar: { width: '100%', height: 4, borderRadius: 2 },
  inadimplentesTitulo: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12, marginTop: 8 },
  inadimplenteItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#fee2e2', backgroundColor: '#fef2f2', borderRadius: 8, paddingHorizontal: 12, marginBottom: 8 },
  inadimplenteIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  inadimplenteApto: { fontSize: 14, fontWeight: 'bold', color: '#ef4444' },
  inadimplenteInfo: { flex: 1 },
  inadimplenteNome: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  inadimplenteDetalhe: { fontSize: 14, color: '#6b7280' },
  inadimplenteStatus: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fef2f2', borderRadius: 16, borderWidth: 1, borderColor: '#fecaca' },
  inadimplenteStatusText: { fontSize: 12, fontWeight: '600', color: '#ef4444' },
  todosEmDia: { alignItems: 'center', paddingVertical: 32 },
  todosEmDiaIcon: { fontSize: 48, marginBottom: 12 },
  todosEmDiaText: { fontSize: 16, fontWeight: '600', color: '#22c55e' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  fabText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalContentLarge: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '95%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#581c87' },
  modalClose: { fontSize: 24, color: '#6b7280' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  dateInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateInput: { flex: 1, textAlign: 'center' },
  dateInputYear: { flex: 1.5, textAlign: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  dateSeparator: { fontSize: 20, fontWeight: 'bold', color: '#6b7280' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  categoriesGridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, zIndex: 1 },
  moradorSelector: { marginTop: 16, marginBottom: 16, padding: 16, backgroundColor: '#dcfce7', borderRadius: 12, borderWidth: 3, borderColor: '#22c55e', zIndex: 10 },
  selectorTitle: { fontSize: 18, fontWeight: 'bold', color: '#15803d', marginBottom: 16, textAlign: 'center' },
  moradoresList: { gap: 8 },
  moradorChip: { padding: 14, borderRadius: 10, borderWidth: 2, borderColor: '#22c55e', backgroundColor: '#fff', marginBottom: 10 },
  moradorChipActive: { backgroundColor: '#22c55e', borderColor: '#15803d' },
  moradorChipText: { fontSize: 15, color: '#374151', fontWeight: '600' },
  moradorChipTextActive: { color: '#fff', fontWeight: 'bold' },
  alertBox: { backgroundColor: '#fef3c7', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#fbbf24', marginTop: 8 },
  alertText: { color: '#92400e', fontSize: 14, textAlign: 'center' },
  moradoresScroll: { maxHeight: 200, marginTop: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  categoryChipActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  categoryChipText: { fontSize: 14, color: '#374151' },
  categoryChipTextActive: { color: '#fff', fontWeight: '600' },
  submitButton: { backgroundColor: '#7c3aed', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 16 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default App;