import React from 'react';
import { X, ExternalLink } from 'lucide-react';

export default function TicketPassPage({
  ticketParam,
  eventParticipants = [],
  events = [],
  currentUser
}) {
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
  const attendeeEmail = participant?.email || currentUser?.email || `${(participant?.username || 'peserta')}@gmail.com`;
  const eventTitle = event?.title || participant?.eventTitle || 'Event ngonten.id';
  const isCheckedIn = !!participant?.isCheckedIn;

  const eventSlugOrId = event?.slug || event?.id || participant?.eventId || '';

  const handleOpenEvent = () => {
    if (eventSlugOrId) {
      window.location.href = `/event/${eventSlugOrId}`;
    } else {
      window.location.href = `/events`;
    }
  };

  const handleClose = () => {
    if (eventSlugOrId) {
      window.location.href = `/event/${eventSlugOrId}`;
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#09090b',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 16px 50px 16px',
      boxSizing: 'border-box'
    }}>
      {/* Standalone Ticket Card */}
      <div style={{
        background: '#ffffff',
        color: '#111827',
        width: '100%',
        maxWidth: '370px',
        borderRadius: '24px',
        padding: '28px 24px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
        border: '2px solid #111827',
        boxSizing: 'border-box'
      }}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: '#111827',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Tutup Tiket"
        >
          <X size={20} />
        </button>

        {/* Top Header Badge (Pure White Text on Black Pill) */}
        <div className="ticket-header-pill" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#111827',
          border: '2px solid #111827',
          padding: '6px 16px',
          borderRadius: '20px',
          marginBottom: '14px'
        }}>
          <span className="ticket-header-pill-text" style={{
            color: '#ffffff',
            WebkitTextFillColor: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            display: 'block'
          }}>
            SCAN TIKET MASUK
          </span>
        </div>

        {/* Event Title */}
        <h3 style={{
          margin: '0 0 16px 0',
          color: '#111827',
          fontSize: '1.15rem',
          fontWeight: '800',
          lineHeight: '1.4',
          padding: '0 10px',
          wordBreak: 'break-word'
        }}>
          {eventTitle}
        </h3>

        {/* High Contrast QR Code Container */}
        <div style={{
          background: '#ffffff',
          padding: '12px',
          borderRadius: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '4px',
          border: '2px solid #111827',
          width: '210px',
          height: '210px',
          boxSizing: 'border-box'
        }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(ticketCode)}`}
            alt="QR Code Tiket"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Dotted dividing line with aligned side notches */}
        <div style={{
          position: 'relative',
          borderTop: '2px dashed #111827',
          margin: '24px -28px 20px -28px',
          height: '0px'
        }}>
          {/* Left Notch */}
          <div style={{
            position: 'absolute',
            left: '-12px',
            top: '-12px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#09090b',
            borderRight: '2px solid #111827',
            zIndex: 3
          }} />
          {/* Right Notch */}
          <div style={{
            position: 'absolute',
            right: '-12px',
            top: '-12px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#09090b',
            borderLeft: '2px solid #111827',
            zIndex: 3
          }} />
        </div>

        {/* Monospace Ticket Code (Centered, without copy button) */}
        <div style={{
          fontSize: '1.3rem',
          color: '#111827',
          fontWeight: '900',
          fontFamily: 'monospace',
          letterSpacing: '2px',
          marginBottom: '14px',
          textAlign: 'center'
        }}>
          {ticketCode}
        </div>

        {/* Attendee Details Box */}
        <div style={{
          fontSize: '0.76rem',
          color: '#111827',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          textAlign: 'left',
          background: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '2px solid #111827',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#475569', fontSize: '0.74rem', fontWeight: '600' }}>Nama:</span>
            <span style={{ color: '#111827', fontWeight: '800' }}>{attendeeName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#475569', fontSize: '0.74rem', fontWeight: '600' }}>Email:</span>
            <span style={{ color: '#111827', fontWeight: '700' }}>{attendeeEmail}</span>
          </div>
        </div>

        {/* Check-In Status Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.74rem',
          background: isCheckedIn ? '#111827' : '#ffffff',
          color: isCheckedIn ? '#ffffff' : '#111827',
          padding: '6px 16px',
          borderRadius: '30px',
          fontWeight: '800',
          letterSpacing: '0.5px',
          border: '2px solid #111827',
          marginBottom: '16px'
        }}>
          <span>{isCheckedIn ? 'SUDAH CHECK-IN' : 'BELUM CHECK-IN'}</span>
        </div>

        {/* Direct Link to Full Event Page */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
          <button
            onClick={handleOpenEvent}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2563eb',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Buka Informasi & Rundown Acara</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#94a3b8' }}>
          ngonten<span style={{ color: '#38bdf8' }}>.id</span>
        </span>
      </div>
    </div>
  );
}
