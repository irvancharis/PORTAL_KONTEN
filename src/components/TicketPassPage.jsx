import React, { useState } from 'react';
import { 
  QrCode, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle2, 
  Download, 
  Share2, 
  ArrowLeft, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Copy,
  Clock
} from 'lucide-react';

export default function TicketPassPage({
  ticketParam,
  eventParticipants = [],
  events = [],
  currentUser,
  onNavigateHome,
  onNavigateEvent
}) {
  const [copied, setCopied] = useState(false);

  // 1. Find participant by ticket code or participant ID
  const cleanParam = (ticketParam || '').trim().toLowerCase();
  const participant = eventParticipants.find(p => 
    (p.ticketCode && p.ticketCode.toLowerCase() === cleanParam) ||
    (p.id && p.id.toLowerCase() === cleanParam) ||
    (p.ticketCode && p.ticketCode.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanParam.replace(/[^a-z0-9]/g, ''))
  );

  // 2. Find event
  const event = participant 
    ? events.find(e => e.id === participant.eventId)
    : events.find(e => e.id === ticketParam || (e.slug && e.slug.toLowerCase() === cleanParam));

  const ticketCode = participant?.ticketCode || (participant ? `TKT-${participant.id.substring(participant.id.length - 6).toUpperCase()}` : (ticketParam ? ticketParam.toUpperCase() : 'TKT-OFFICIAL'));
  const attendeeName = participant?.name || participant?.username || currentUser?.name || currentUser?.username || 'Peserta Terdaftar';
  const eventTitle = event?.title || participant?.eventTitle || 'Event ngonten.id';
  const eventLocation = event?.location || event?.venue || 'Lokasi Acara Sesuai Jadwal';
  const eventDate = event?.date || event?.startDate || 'Sesuai Jadwal Event';
  const isCheckedIn = participant?.isCheckedIn;
  const isPaid = participant?.isPaid || (event?.ticketPrice === 0 || !event?.ticketPrice);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `E-Tiket: ${eventTitle}`,
        text: `E-Tiket Resmi ${eventTitle} untuk ${attendeeName} (${ticketCode})`,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopyCode();
      alert('Tautan tiket berhasil disalin ke clipboard!');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main, #09090b)',
      color: 'var(--text-primary, #ffffff)',
      padding: '24px 16px 60px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      boxSizing: 'border-box'
    }}>
      {/* Top Navigation Bar */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <button
          onClick={onNavigateHome}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'inherit',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '0.82rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          <span>Beranda</span>
        </button>

        <span style={{ fontSize: '1.05rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
          ngonten<span style={{ color: '#38bdf8' }}>.id</span> Pass
        </span>

        <button
          onClick={handleShare}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'inherit',
            borderRadius: '10px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          aria-label="Bagikan Tiket"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Main Boarding Pass Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        border: '1px solid #e2e8f0',
        position: 'relative'
      }}>
        {/* Card Header (Dark Top Strip) */}
        <div style={{
          backgroundColor: '#09090b',
          color: '#ffffff',
          padding: '20px 24px',
          borderBottom: '1px solid #27272a'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{
              backgroundColor: '#38bdf8',
              color: '#09090b',
              fontSize: '0.68rem',
              fontWeight: '900',
              padding: '3px 8px',
              borderRadius: '6px',
              letterSpacing: '0.5px'
            }}>
              {event?.category ? event.category.toUpperCase() : 'E-TIKET RESMI'}
            </span>

            <span style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              color: isCheckedIn ? '#4ade80' : '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ShieldCheck size={14} />
              {isCheckedIn ? 'SUDAH CHECK-IN' : 'TIKET VALID & AKTIF'}
            </span>
          </div>

          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: '900',
            lineHeight: '1.3',
            margin: '0 0 4px 0',
            color: '#ffffff'
          }}>
            {eventTitle}
          </h1>

          {event?.organizerName && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
              Oleh: {event.organizerName}
            </span>
          )}
        </div>

        {/* Middle QR Code Section */}
        <div style={{
          padding: '24px 20px',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          borderBottom: '2px dashed #cbd5e1',
          position: 'relative'
        }}>
          {/* Left & Right Notch Cutouts for Ticket aesthetic */}
          <div style={{
            position: 'absolute',
            bottom: '-12px',
            left: '-12px',
            width: '24px',
            height: '24px',
            backgroundColor: 'var(--bg-main, #09090b)',
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-12px',
            right: '-12px',
            width: '24px',
            height: '24px',
            backgroundColor: 'var(--bg-main, #09090b)',
            borderRadius: '50%'
          }} />

          {/* QR Code Graphic */}
          <div style={{
            display: 'inline-block',
            padding: '12px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '2px solid #0f172a',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
          }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ticketCode)}`}
              alt={`QR Code ${ticketCode}`}
              style={{
                width: '190px',
                height: '190px',
                display: 'block',
                imageRendering: 'crisp-edges'
              }}
            />
          </div>

          {/* Ticket Code Text & Copy */}
          <div style={{ marginTop: '14px' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
              KODE E-TIKET RESMI
            </span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: '900',
                fontFamily: 'monospace',
                letterSpacing: '2px',
                color: '#0f172a'
              }}>
                {ticketCode}
              </span>
              <button
                onClick={handleCopyCode}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Copy size={12} />
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
          </div>

          <div style={{
            fontSize: '0.74rem',
            color: '#475569',
            marginTop: '8px',
            fontWeight: '500'
          }}>
            Tunjukkan QR Code ini kepada panitia saat registrasi di lokasi acara.
          </div>
        </div>

        {/* Bottom Details Grid */}
        <div style={{ padding: '22px 24px', backgroundColor: '#ffffff' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
            marginBottom: '18px'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', display: 'block' }}>
                NAMA PESERTA
              </span>
              <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block', wordBreak: 'break-word' }}>
                {attendeeName}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', display: 'block' }}>
                STATUS PENDAFTARAN
              </span>
              <strong style={{ fontSize: '0.92rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> Disetujui
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', display: 'block' }}>
                TANGGAL & WAKTU
              </span>
              <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="#64748b" />
                {eventDate}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', display: 'block' }}>
                LOKASI / VENUE
              </span>
              <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', wordBreak: 'break-word' }}>
                <MapPin size={14} color="#64748b" />
                {eventLocation}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {event && (
              <button
                onClick={() => onNavigateEvent(event)}
                style={{
                  width: '100%',
                  padding: '13px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>Buka Detail Acara & Rundown</span>
                <ExternalLink size={16} color="#ffffff" />
              </button>
            )}

            <button
              onClick={() => window.print()}
              style={{
                width: '100%',
                padding: '11px',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Download size={16} />
              <span>Simpan / Cetak E-Tiket (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div style={{ marginTop: '24px', textAlign: 'center', maxWidth: '360px' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted, #71717a)', margin: 0, lineHeight: '1.5' }}>
          Tiket ini diterbitkan secara sah oleh platform <strong>ngonten.id</strong>. Verifikasi keaslian tiket dilakukan langsung oleh panitia penyelenggara melalui pemindaian QR Code di lokasi acara.
        </p>
      </div>
    </div>
  );
}
