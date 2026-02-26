'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useMissionControl } from '@/lib/store';
import { connectionManager } from '@/lib/services/connectionService';
import type { ConnectionType, ClawConnection } from '@/lib/types';
import { cn, generateId } from '@/lib/utils';

// --- Wizard Steps ---
type WizardStep =
  | 'welcome'
  | 'connection-type'
  | 'endpoint'
  | 'test'
  | 'bot-config'
  | 'summary';

const STEPS: WizardStep[] = [
  'welcome',
  'connection-type',
  'endpoint',
  'test',
  'bot-config',
  'summary',
];

const STEP_LABELS: Record<WizardStep, string> = {
  welcome: 'Welcome',
  'connection-type': 'Protocol',
  endpoint: 'Endpoint',
  test: 'Test',
  'bot-config': 'Configure',
  summary: 'Complete',
};

// --- Preset Configs ---
interface PresetConfig {
  name: string;
  description: string;
  icon: string;
  type: ConnectionType;
  port: number;
  path: string;
  useTls: boolean;
}

const PRESETS: PresetConfig[] = [
  {
    name: 'Local Dev Server',
    description: 'Connect to a Claw Bot running on localhost',
    icon: '💻',
    type: 'websocket',
    port: 8080,
    path: '/ws',
    useTls: false,
  },
  {
    name: 'Production API',
    description: 'Connect to a production Claw Bot via HTTPS REST API',
    icon: '🌐',
    type: 'rest',
    port: 443,
    path: '/api',
    useTls: true,
  },
  {
    name: 'ESP32 / Hardware Bot',
    description: 'Connect to an ESP32 or Raspberry Pi running a WebSocket server',
    icon: '🔌',
    type: 'websocket',
    port: 81,
    path: '/',
    useTls: false,
  },
  {
    name: 'MQTT Broker',
    description: 'Connect via MQTT-over-WebSocket for IoT devices',
    icon: '📡',
    type: 'mqtt',
    port: 9001,
    path: '/mqtt',
    useTls: false,
  },
  {
    name: 'Cloud Agent (OpenClaw)',
    description: 'Connect to an OpenClaw-compatible cloud agent gateway',
    icon: '☁️',
    type: 'rest',
    port: 443,
    path: '/v1',
    useTls: true,
  },
  {
    name: 'Custom Setup',
    description: 'Configure every detail manually',
    icon: '⚙️',
    type: 'websocket',
    port: 8080,
    path: '/ws',
    useTls: false,
  },
];

const clawAvatars = ['🦀', '🦞', '🦐', '🦑', '🐙', '🐚', '🪸', '🦂', '🕷️', '🤖'];
const clawColors = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#f97316'];

export function SetupWizard() {
  const addClaw = useMissionControl((s) => s.addClaw);
  const addConnection = useMissionControl((s) => s.addConnection);
  const addNotification = useMissionControl((s) => s.addNotification);
  const setActiveScreen = useMissionControl((s) => s.setActiveScreen);
  const setWizardCompleted = useMissionControl((s) => s.setWizardCompleted);
  const addMemory = useMissionControl((s) => s.addMemory);

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [selectedPreset, setSelectedPreset] = useState<PresetConfig | null>(null);

  // Connection config
  const [connType, setConnType] = useState<ConnectionType>('websocket');
  const [endpoint, setEndpoint] = useState('');
  const [port, setPort] = useState(8080);
  const [path, setPath] = useState('/ws');
  const [useTls, setUseTls] = useState(false);
  const [authToken, setAuthToken] = useState('');

  // Test state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latency?: number;
    error?: string;
    serverInfo?: unknown;
  } | null>(null);

  // Bot config
  const [botName, setBotName] = useState('');
  const [botDesc, setBotDesc] = useState('');
  const [botAvatar, setBotAvatar] = useState('🦀');
  const [botColor, setBotColor] = useState('#06b6d4');

  // Logs
  const [logs, setLogs] = useState<Array<{ time: string; message: string; type: 'info' | 'success' | 'error' }>>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, message, type }]);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- Navigation ---
  const currentIndex = STEPS.indexOf(currentStep);

  const goNext = () => {
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const goToStep = (step: WizardStep) => {
    const targetIndex = STEPS.indexOf(step);
    if (targetIndex <= currentIndex) {
      setCurrentStep(step);
    }
  };

  // --- Apply Preset ---
  const applyPreset = (preset: PresetConfig) => {
    setSelectedPreset(preset);
    setConnType(preset.type);
    setPort(preset.port);
    setPath(preset.path);
    setUseTls(preset.useTls);

    if (preset.name === 'Local Dev Server') {
      setEndpoint('localhost');
    } else if (preset.name === 'ESP32 / Hardware Bot') {
      setEndpoint('192.168.4.1');
    } else {
      setEndpoint('');
    }
  };

  // --- Test Connection ---
  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    setLogs([]);

    addLog(`Initiating ${connType} connection test...`);
    addLog(`Target: ${useTls ? (connType === 'rest' ? 'https' : 'wss') : (connType === 'rest' ? 'http' : 'ws')}://${endpoint}:${port}${path}`);

    if (authToken) {
      addLog('Authentication token provided');
    }

    try {
      addLog('Attempting connection...');
      const result = await connectionManager.testConnection(
        connType,
        endpoint,
        port,
        path,
        useTls,
        authToken || undefined,
      );

      setTestResult(result);

      if (result.success) {
        addLog(`Connection successful! Latency: ${result.latency}ms`, 'success');
        if (result.serverInfo) {
          addLog(`Server info: ${JSON.stringify(result.serverInfo)}`, 'success');
        }
      } else {
        addLog(`Connection failed: ${result.error}`, 'error');
        if (result.latency) {
          addLog(`Response time: ${result.latency}ms`, 'info');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setTestResult({ success: false, error: message });
      addLog(`Error: ${message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  // --- Complete Wizard ---
  const completeSetup = () => {
    const clawId = generateId('claw');

    // Create the connection object
    const connection: ClawConnection = {
      id: generateId('conn'),
      clawId,
      type: connType,
      endpoint,
      port,
      path,
      useTls,
      authToken: authToken || undefined,
      status: 'disconnected',
      messagesReceived: 0,
      messagesSent: 0,
    };

    // Add the claw
    addClaw({
      name: botName || 'Unnamed Claw',
      description: botDesc || `Connected via ${connType.toUpperCase()}`,
      avatar: botAvatar,
      color: botColor,
      agents: [],
      isActive: false,
    });

    // Store connection config
    addConnection(connection);

    // Add setup memory
    addMemory({
      title: `Claw Bot Connected: ${botName}`,
      content: `New Claw Bot "${botName}" configured with ${connType.toUpperCase()} connection to ${endpoint}:${port}${path}. ${useTls ? 'TLS enabled.' : 'No TLS.'} ${authToken ? 'Authenticated.' : 'No auth.'}`,
      category: 'context',
      source: 'system',
      tags: ['connection', 'setup', connType],
    });

    // Notify
    addNotification({
      title: 'Claw Bot Connected',
      message: `${botName} has been configured and is ready to connect.`,
      type: 'success',
    });

    setWizardCompleted(true);

    // Navigate to Claw Manager
    setActiveScreen('claws');
  };

  // --- Render Steps ---

  const renderWelcome = () => (
    <div className="text-center max-w-2xl mx-auto">
      <div className="text-6xl mb-6 animate-float">🦀</div>
      <h2 className="text-2xl font-bold text-white mb-4">
        Connect Your Claw Bot
      </h2>
      <p className="text-gray-400 mb-8 leading-relaxed">
        This wizard will guide you through connecting a Claw Bot instance to your Mission Control.
        Whether it&apos;s a local development server, a cloud-hosted AI agent,
        an ESP32 hardware controller, or an MQTT IoT device &mdash; we&apos;ll get it connected.
      </p>

      <div className="glass-panel p-6 text-left mb-8">
        <h3 className="text-sm font-semibold text-white mb-4">What you&apos;ll need:</h3>
        <div className="space-y-3">
          {[
            { icon: '🔗', text: 'The endpoint URL or IP address of your Claw Bot' },
            { icon: '🔑', text: 'Authentication token (if your bot requires it)' },
            { icon: '📡', text: 'The protocol your bot uses (WebSocket, REST API, or MQTT)' },
            { icon: '🌐', text: 'Network access to the bot (same network or public endpoint)' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-gray-300">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 text-left">
        <h3 className="text-sm font-semibold text-white mb-3">Supported Protocols</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg" style={{ background: 'var(--glass-light)' }}>
            <p className="text-sm font-medium text-white mb-1">WebSocket</p>
            <p className="text-xs text-gray-500">Real-time bidirectional communication. Best for live control and streaming updates.</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--glass-light)' }}>
            <p className="text-sm font-medium text-white mb-1">REST API</p>
            <p className="text-xs text-gray-500">HTTP request/response. Best for cloud APIs and stateless agent services.</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--glass-light)' }}>
            <p className="text-sm font-medium text-white mb-1">MQTT</p>
            <p className="text-xs text-gray-500">Lightweight pub/sub messaging. Best for IoT devices and hardware bots.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConnectionType = () => (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-2">Choose a Setup Preset</h2>
      <p className="text-sm text-gray-400 mb-6">
        Select a preset that matches your Claw Bot setup, or choose &quot;Custom Setup&quot; to configure everything manually.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            className={cn(
              'glass-panel p-5 text-left transition-all duration-300 group',
              selectedPreset?.name === preset.name
                ? 'ring-2'
                : 'hover:border-white/20',
            )}
            style={{
              borderColor: selectedPreset?.name === preset.name ? 'var(--accent-primary)' : undefined,
              boxShadow: selectedPreset?.name === preset.name ? '0 0 20px var(--accent-glow)' : undefined,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ background: 'var(--glass-heavy)' }}
              >
                {preset.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{preset.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{preset.description}</p>
                <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--glass-heavy)', color: 'var(--accent-primary)' }}>
                    {preset.type.toUpperCase()}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--glass-heavy)', color: 'var(--accent-secondary)' }}>
                    Port {preset.port}
                  </span>
                  {preset.useTls && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                      TLS
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderEndpoint = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-2">Configure Endpoint</h2>
      <p className="text-sm text-gray-400 mb-6">
        Enter the connection details for your Claw Bot.
        {selectedPreset && selectedPreset.name !== 'Custom Setup' && (
          <span style={{ color: 'var(--accent-primary)' }}> Preset: {selectedPreset.name}</span>
        )}
      </p>

      <div className="glass-panel p-6 space-y-5">
        {/* Connection Type */}
        <div>
          <label className="text-xs text-gray-400 mb-2 block">Connection Protocol</label>
          <div className="flex gap-2">
            {(['websocket', 'rest', 'mqtt'] as ConnectionType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setConnType(type);
                  if (type === 'rest') {
                    setPath('/api');
                    setPort(useTls ? 443 : 8080);
                  } else if (type === 'mqtt') {
                    setPath('/mqtt');
                    setPort(9001);
                  } else {
                    setPath('/ws');
                    setPort(8080);
                  }
                }}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                  connType === type ? 'text-black' : 'text-gray-400',
                )}
                style={{
                  background: connType === type ? 'var(--accent-primary)' : 'var(--glass-light)',
                  borderColor: connType === type ? 'var(--accent-primary)' : 'var(--glass-border)',
                }}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Endpoint */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Host / IP Address
          </label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder={connType === 'rest' ? 'api.example.com' : 'localhost or 192.168.1.100'}
            className="input-glass"
          />
          <p className="text-[10px] text-gray-600 mt-1">
            Enter hostname or IP without protocol prefix (no http:// or ws://)
          </p>
        </div>

        {/* Port & Path */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Port</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value) || 0)}
              placeholder="8080"
              className="input-glass"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Path</label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder={connType === 'rest' ? '/api' : '/ws'}
              className="input-glass"
            />
          </div>
        </div>

        {/* TLS */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUseTls(!useTls)}
            className={cn(
              'w-10 h-6 rounded-full transition-all relative',
              useTls ? 'bg-green-500' : 'bg-gray-700',
            )}
          >
            <div
              className={cn(
                'w-4 h-4 rounded-full bg-white absolute top-1 transition-all',
                useTls ? 'left-5' : 'left-1',
              )}
            />
          </button>
          <div>
            <span className="text-sm text-white">Use TLS / SSL</span>
            <p className="text-[10px] text-gray-500">
              {connType === 'rest' ? 'HTTPS' : connType === 'websocket' ? 'WSS' : 'WSS (MQTT over secure WebSocket)'}
            </p>
          </div>
        </div>

        {/* Auth Token */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Authentication Token <span className="text-gray-600">(optional)</span>
          </label>
          <input
            type="password"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            placeholder="Bearer token or API key"
            className="input-glass"
          />
          <p className="text-[10px] text-gray-600 mt-1">
            {connType === 'rest'
              ? 'Sent as Authorization: Bearer header'
              : 'Sent as auth message after connection'}
          </p>
        </div>

        {/* Connection Preview */}
        <div className="p-3 rounded-lg" style={{ background: 'var(--glass-heavy)' }}>
          <p className="text-[10px] text-gray-500 mb-1">Connection URL Preview</p>
          <code className="text-xs font-mono break-all" style={{ color: 'var(--accent-primary)' }}>
            {connType === 'rest'
              ? `${useTls ? 'https' : 'http'}://${endpoint || '<host>'}:${port}${path}`
              : `${useTls ? 'wss' : 'ws'}://${endpoint || '<host>'}:${port}${path}`}
          </code>
        </div>
      </div>
    </div>
  );

  const renderTest = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-2">Test Connection</h2>
      <p className="text-sm text-gray-400 mb-6">
        Let&apos;s verify that your Claw Bot is reachable and responding correctly.
      </p>

      {/* Connection Summary */}
      <div className="glass-panel p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-[10px] text-gray-500">Protocol</p>
            <p className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
              {connType.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500">Endpoint</p>
            <p className="text-sm font-medium text-white truncate">{endpoint}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500">Port</p>
            <p className="text-sm font-medium text-white">{port}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500">TLS</p>
            <p className="text-sm font-medium" style={{ color: useTls ? '#10b981' : '#6b7280' }}>
              {useTls ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>

      {/* Test Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={runTest}
          disabled={testing || !endpoint}
          className={cn(
            'px-8 py-3 rounded-xl font-medium text-sm transition-all',
            testing
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:brightness-110',
          )}
          style={{
            background: 'var(--accent-primary)',
            color: '#0a0a1a',
            boxShadow: '0 0 20px var(--accent-glow)',
          }}
        >
          {testing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Testing Connection...
            </span>
          ) : (
            'Run Connection Test'
          )}
        </button>
      </div>

      {/* Test Result */}
      {testResult && (
        <div
          className={cn(
            'glass-panel p-5 mb-6 animate-slide-in',
            testResult.success ? 'border-green-500/30' : 'border-red-500/30',
          )}
          style={{
            borderColor: testResult.success ? '#10b98150' : '#ef444450',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-xl',
                testResult.success ? 'bg-green-500/10' : 'bg-red-500/10',
              )}
            >
              {testResult.success ? '✓' : '✗'}
            </div>
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: testResult.success ? '#10b981' : '#ef4444' }}
              >
                {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
              </h3>
              {testResult.latency && (
                <p className="text-xs text-gray-500">Latency: {testResult.latency}ms</p>
              )}
            </div>
          </div>

          {testResult.error && (
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 mb-3">
              <p className="text-xs text-red-400 font-mono">{testResult.error}</p>
            </div>
          )}

          {testResult.serverInfo != null && (
            <div className="p-3 rounded-lg" style={{ background: 'var(--glass-light)' }}>
              <p className="text-[10px] text-gray-500 mb-1">Server Response</p>
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(testResult.serverInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Connection Log */}
      <div className="glass-panel p-4">
        <h3 className="text-xs font-semibold text-gray-400 mb-3">Connection Log</h3>
        <div
          className="h-48 overflow-y-auto rounded-lg p-3 font-mono text-xs space-y-1"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          {logs.length === 0 ? (
            <p className="text-gray-600">Click &quot;Run Connection Test&quot; to begin...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-gray-600 flex-shrink-0">[{log.time}]</span>
                <span
                  className={cn(
                    log.type === 'success' && 'text-green-400',
                    log.type === 'error' && 'text-red-400',
                    log.type === 'info' && 'text-gray-400',
                  )}
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* Skip hint */}
      {!testResult?.success && (
        <p className="text-center text-[10px] text-gray-600 mt-4">
          Connection test failed? You can still continue and configure your bot.
          The connection can be established later from the Claw Manager.
        </p>
      )}
    </div>
  );

  const renderBotConfig = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-2">Configure Your Claw Bot</h2>
      <p className="text-sm text-gray-400 mb-6">
        Give your Claw Bot a name and identity in Mission Control.
      </p>

      <div className="glass-panel p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Bot Name</label>
          <input
            type="text"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            placeholder="e.g., Clawbot Alpha, Home Lab Bot, Production Agent"
            className="input-glass"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Description</label>
          <input
            type="text"
            value={botDesc}
            onChange={(e) => setBotDesc(e.target.value)}
            placeholder="What does this bot do?"
            className="input-glass"
          />
        </div>

        {/* Avatar */}
        <div>
          <label className="text-xs text-gray-400 mb-2 block">Avatar</label>
          <div className="flex gap-2 flex-wrap">
            {clawAvatars.map((a) => (
              <button
                key={a}
                onClick={() => setBotAvatar(a)}
                className="w-11 h-11 rounded-lg flex items-center justify-center text-xl transition-all"
                style={{
                  background: 'var(--glass-light)',
                  boxShadow: botAvatar === a ? '0 0 0 2px var(--accent-primary)' : undefined,
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="text-xs text-gray-400 mb-2 block">Color Theme</label>
          <div className="flex gap-2 flex-wrap">
            {clawColors.map((c) => (
              <button
                key={c}
                onClick={() => setBotColor(c)}
                className={cn(
                  'w-11 h-11 rounded-lg transition-all',
                  botColor === c && 'ring-2 ring-white',
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="glass-panel p-4">
          <p className="text-[10px] text-gray-500 mb-3">Preview</p>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                background: `${botColor}15`,
                border: `2px solid ${botColor}50`,
                boxShadow: `0 0 20px ${botColor}30`,
              }}
            >
              {botAvatar}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{botName || 'Unnamed Bot'}</h3>
              <p className="text-xs text-gray-500">{botDesc || 'No description'}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-[10px] text-gray-500">Ready to connect</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="text-5xl mb-4">
        {testResult?.success ? '🎉' : '⚙️'}
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        {testResult?.success ? 'All Set!' : 'Configuration Complete'}
      </h2>
      <p className="text-sm text-gray-400 mb-8">
        {testResult?.success
          ? 'Your Claw Bot is configured and the connection was verified successfully.'
          : 'Your Claw Bot is configured. You can connect to it from the Claw Manager.'}
      </p>

      {/* Summary Cards */}
      <div className="glass-panel p-6 text-left mb-6">
        <h3 className="text-sm font-semibold text-white mb-4">Configuration Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <span className="text-xs text-gray-500">Bot Name</span>
            <span className="text-sm text-white font-medium">{botName || 'Unnamed Bot'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <span className="text-xs text-gray-500">Protocol</span>
            <span className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
              {connType.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <span className="text-xs text-gray-500">Endpoint</span>
            <code className="text-sm font-mono text-gray-300">
              {endpoint}:{port}{path}
            </code>
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <span className="text-xs text-gray-500">TLS / SSL</span>
            <span className="text-sm" style={{ color: useTls ? '#10b981' : '#6b7280' }}>
              {useTls ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <span className="text-xs text-gray-500">Authentication</span>
            <span className="text-sm text-gray-300">
              {authToken ? 'Token configured' : 'No auth'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-gray-500">Connection Test</span>
            <span
              className="text-sm font-medium"
              style={{ color: testResult?.success ? '#10b981' : '#f59e0b' }}
            >
              {testResult?.success
                ? `Passed (${testResult.latency}ms)`
                : testResult
                  ? 'Failed'
                  : 'Skipped'}
            </span>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="glass-panel p-6 text-left">
        <h3 className="text-sm font-semibold text-white mb-3">What&apos;s Next?</h3>
        <div className="space-y-2">
          {[
            { icon: '🦀', text: 'Go to Claw Manager to connect and manage your bot' },
            { icon: '⚡', text: 'Assign AI agents to your bot in Team Structure' },
            { icon: '☰', text: 'Create tasks and assign them to your bot\'s agents' },
            { icon: '📡', text: 'Monitor real-time status in the Dashboard' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--glass-light)' }}>
              <span>{item.icon}</span>
              <span className="text-xs text-gray-300">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- Main Render ---
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome': return renderWelcome();
      case 'connection-type': return renderConnectionType();
      case 'endpoint': return renderEndpoint();
      case 'test': return renderTest();
      case 'bot-config': return renderBotConfig();
      case 'summary': return renderSummary();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'welcome': return true;
      case 'connection-type': return selectedPreset !== null;
      case 'endpoint': return endpoint.trim().length > 0 && port > 0;
      case 'test': return true; // can always skip test
      case 'bot-config': return true; // name is optional
      case 'summary': return true;
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, i) => (
            <button
              key={step}
              onClick={() => goToStep(step)}
              className={cn(
                'flex items-center gap-2 transition-all',
                i <= currentIndex ? 'opacity-100' : 'opacity-40',
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  i < currentIndex && 'text-black',
                  i === currentIndex && 'text-black animate-pulse-slow',
                  i > currentIndex && 'text-gray-500',
                )}
                style={{
                  background:
                    i <= currentIndex ? 'var(--accent-primary)' : 'var(--glass-heavy)',
                  boxShadow: i === currentIndex ? '0 0 15px var(--accent-glow)' : undefined,
                }}
              >
                {i < currentIndex ? '✓' : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden md:inline',
                  i === currentIndex ? 'text-white' : 'text-gray-500',
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </button>
          ))}
        </div>
        {/* Progress line */}
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--glass-heavy)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((currentIndex) / (STEPS.length - 1)) * 100}%`,
              background: 'var(--accent-primary)',
              boxShadow: '0 0 10px var(--accent-glow)',
            }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">{renderStep()}</div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className={cn(
            'btn-ghost',
            currentIndex === 0 && 'opacity-30 cursor-not-allowed',
          )}
        >
          Back
        </button>

        <div className="flex gap-3">
          {currentStep === 'test' && !testResult?.success && (
            <button onClick={goNext} className="btn-ghost">
              Skip Test
            </button>
          )}

          {currentStep === 'summary' ? (
            <button
              onClick={completeSetup}
              className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all text-black"
              style={{
                background: 'var(--accent-primary)',
                boxShadow: '0 0 20px var(--accent-glow)',
              }}
            >
              Complete Setup
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className={cn(
                'btn-primary',
                !canProceed() && 'opacity-30 cursor-not-allowed',
              )}
            >
              {currentStep === 'test' && testResult?.success ? 'Continue' : 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
