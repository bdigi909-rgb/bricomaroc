-- ============================================================
-- BricoMaroc — Schéma PostgreSQL complet
-- Supabase Migration 001 — Initial Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- recherche full-text

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('client', 'artisan', 'admin');
CREATE TYPE artisan_status AS ENUM ('pending', 'verified', 'suspended', 'excluded');
CREATE TYPE artisan_badge AS ENUM ('none', 'verified', 'elite');
CREATE TYPE demande_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE urgence_level AS ENUM ('normal', 'urgent', 'very_urgent');
CREATE TYPE devis_status AS ENUM ('draft', 'sent', 'accepted', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'held', 'released', 'refunded');
CREATE TYPE payment_method AS ENUM ('cmi', 'stripe', 'cash', 'wallet');

-- ============================================================
-- TABLE: USERS
-- ============================================================

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT UNIQUE,
  full_name     TEXT NOT NULL,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'client',
  ville         TEXT DEFAULT 'Marrakech',
  quartier      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: CATEGORIES
-- ============================================================

CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL,
  nom         TEXT NOT NULL,
  nom_ar      TEXT,
  icone       TEXT NOT NULL,
  couleur     TEXT DEFAULT '#1B7A56',
  position    INT DEFAULT 0,
  active      BOOLEAN DEFAULT TRUE
);

INSERT INTO categories (slug, nom, nom_ar, icone, couleur, position) VALUES
  ('plomberie',     'Plomberie',     'السباكة',          '🔧', '#1A56A0', 1),
  ('electricite',   'Électricité',   'الكهرباء',         '⚡', '#D4880A', 2),
  ('peinture',      'Peinture',      'الدهان',           '🎨', '#E8622A', 3),
  ('climatisation', 'Climatisation', 'التكييف',          '❄️', '#2E86C1', 4),
  ('menuiserie',    'Menuiserie',    'النجارة',          '🪵', '#7B5EA7', 5),
  ('carrelage',     'Carrelage',     'البلاط',           '🪟', '#C0392B', 6),
  ('maconnerie',    'Maçonnerie',    'البناء',           '🏗️', '#7F8C8D', 7),
  ('jardinage',     'Jardinage',     'البستنة',          '🌿', '#27AE60', 8),
  ('serrurerie',    'Serrurerie',    'القفل',            '🔒', '#2C3E50', 9),
  ('bricolage',     'Bricolage',     'الإصلاح العام',    '🛠️', '#8E44AD', 10);

-- ============================================================
-- TABLE: ARTISANS
-- ============================================================

CREATE TABLE artisans (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Profil
  bio                 TEXT,
  annees_experience   INT DEFAULT 0,
  langues             TEXT[] DEFAULT ARRAY['fr', 'ar'],

  -- Localisation
  ville               TEXT DEFAULT 'Marrakech',
  quartiers           TEXT[] DEFAULT ARRAY[]::TEXT[],
  rayon_km            INT DEFAULT 15,
  latitude            DECIMAL(10, 8),
  longitude           DECIMAL(11, 8),

  -- Statut & Badges
  statut              artisan_status DEFAULT 'pending',
  badge               artisan_badge DEFAULT 'none',
  cin_verifie         BOOLEAN DEFAULT FALSE,
  cin_recto_url       TEXT,
  cin_verso_url       TEXT,
  selfie_url          TEXT,
  assurance_url       TEXT,

  -- Disponibilité
  disponible          BOOLEAN DEFAULT TRUE,
  jours_dispo         INT[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Lundi ... 7=Dimanche
  heure_debut         TIME DEFAULT '08:00',
  heure_fin           TIME DEFAULT '18:00',
  urgences_24h        BOOLEAN DEFAULT FALSE,

  -- Tarification
  frais_deplacement   INT DEFAULT 50,
  tarif_min           INT DEFAULT 100,
  tarif_max           INT DEFAULT 300,
  devis_gratuit       BOOLEAN DEFAULT TRUE,
  surcoût_urgence     INT DEFAULT 20, -- pourcentage

  -- Métriques calculées (mises à jour automatiquement)
  note_moyenne        DECIMAL(3,2) DEFAULT 0.00,
  nb_avis             INT DEFAULT 0,
  nb_missions         INT DEFAULT 0,
  taux_reponse        INT DEFAULT 0, -- pourcentage
  delai_moyen_reponse INT DEFAULT 0, -- minutes

  -- Abonnement
  plan                TEXT DEFAULT 'free', -- free | pro | vip
  plan_expire_at      TIMESTAMPTZ,

  -- Wallet
  solde_wallet        INT DEFAULT 0, -- MAD en centimes

  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================================
-- TABLE: ARTISAN_CATEGORIES (liaison N:N)
-- ============================================================

CREATE TABLE artisan_categories (
  artisan_id    UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  categorie_id  UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  tarif_min     INT,
  tarif_max     INT,
  PRIMARY KEY (artisan_id, categorie_id)
);

-- ============================================================
-- TABLE: DEMANDES
-- ============================================================

CREATE TABLE demandes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artisan_id        UUID REFERENCES artisans(id) ON DELETE SET NULL,
  categorie_id      UUID NOT NULL REFERENCES categories(id),

  -- Description
  titre             TEXT NOT NULL,
  description       TEXT NOT NULL,
  photos_urls       TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Localisation
  adresse           TEXT NOT NULL,
  quartier          TEXT,
  latitude          DECIMAL(10, 8),
  longitude         DECIMAL(11, 8),

  -- Planification
  urgence           urgence_level DEFAULT 'normal',
  date_souhaitee    DATE,
  heure_souhaitee   TIME,
  flexible          BOOLEAN DEFAULT TRUE,

  -- Budget
  budget_min        INT,
  budget_max        INT,
  budget_ia_min     INT,
  budget_ia_max     INT,

  -- Statut
  statut            demande_status DEFAULT 'pending',

  -- Timestamps
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  accepted_at       TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ
);

-- ============================================================
-- TABLE: DEVIS
-- ============================================================

CREATE TABLE devis (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demande_id      UUID NOT NULL REFERENCES demandes(id) ON DELETE CASCADE,
  artisan_id      UUID NOT NULL REFERENCES artisans(id),

  -- Montants
  main_oeuvre     INT NOT NULL DEFAULT 0,
  materiaux       INT DEFAULT 0,
  deplacement     INT DEFAULT 50,
  total           INT GENERATED ALWAYS AS (main_oeuvre + COALESCE(materiaux,0) + COALESCE(deplacement,0)) STORED,

  description     TEXT,
  duree_estimee   TEXT, -- "2h", "1 jour", etc.
  valable_jours   INT DEFAULT 7,

  statut          devis_status DEFAULT 'draft',

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  accepted_at     TIMESTAMPTZ
);

-- ============================================================
-- TABLE: PAIEMENTS
-- ============================================================

CREATE TABLE paiements (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demande_id        UUID NOT NULL REFERENCES demandes(id),
  client_id         UUID NOT NULL REFERENCES users(id),
  artisan_id        UUID NOT NULL REFERENCES artisans(id),

  montant_total     INT NOT NULL, -- en centimes
  commission_rate   INT DEFAULT 10, -- pourcentage
  commission_amt    INT GENERATED ALWAYS AS (montant_total * commission_rate / 100) STORED,
  montant_artisan   INT GENERATED ALWAYS AS (montant_total - (montant_total * commission_rate / 100)) STORED,

  methode           payment_method NOT NULL DEFAULT 'cmi',
  statut            payment_status DEFAULT 'pending',

  -- Références externes
  cmi_ref           TEXT,
  stripe_ref        TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  held_at           TIMESTAMPTZ,
  released_at       TIMESTAMPTZ
);

-- ============================================================
-- TABLE: MESSAGES
-- ============================================================

CREATE TABLE messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demande_id    UUID NOT NULL REFERENCES demandes(id) ON DELETE CASCADE,
  sender_id     UUID NOT NULL REFERENCES users(id),
  receiver_id   UUID NOT NULL REFERENCES users(id),

  contenu       TEXT,
  type          TEXT DEFAULT 'text', -- text | image | devis | system
  media_url     TEXT,
  devis_id      UUID REFERENCES devis(id),

  lu            BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: AVIS
-- ============================================================

CREATE TABLE avis (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demande_id      UUID NOT NULL REFERENCES demandes(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES users(id),
  artisan_id      UUID NOT NULL REFERENCES artisans(id),

  -- Notes
  note_globale      INT NOT NULL CHECK (note_globale BETWEEN 1 AND 5),
  note_qualite      INT CHECK (note_qualite BETWEEN 1 AND 5),
  note_ponctualite  INT CHECK (note_ponctualite BETWEEN 1 AND 5),
  note_comm         INT CHECK (note_comm BETWEEN 1 AND 5),
  note_prix         INT CHECK (note_prix BETWEEN 1 AND 5),

  commentaire       TEXT,
  tags              TEXT[] DEFAULT ARRAY[]::TEXT[],
  photos_avant      TEXT[] DEFAULT ARRAY[]::TEXT[],
  photos_apres      TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Contestation
  conteste          BOOLEAN DEFAULT FALSE,
  contestation_text TEXT,
  contestation_at   TIMESTAMPTZ,
  contestation_statut TEXT DEFAULT 'none', -- none | pending | validated | rejected

  reponse_artisan   TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(demande_id, client_id)
);

-- ============================================================
-- TABLE: SIGNALEMENTS
-- ============================================================

CREATE TABLE signalements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id     UUID NOT NULL REFERENCES users(id),
  artisan_id      UUID NOT NULL REFERENCES artisans(id),
  motif           TEXT NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: PORTFOLIO (photos réalisations)
-- ============================================================

CREATE TABLE portfolio (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id    UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  categorie_id  UUID REFERENCES categories(id),
  titre         TEXT,
  description   TEXT,
  photo_url     TEXT NOT NULL,
  position      INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: WALLET_TRANSACTIONS
-- ============================================================

CREATE TABLE wallet_transactions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id    UUID NOT NULL REFERENCES artisans(id),
  paiement_id   UUID REFERENCES paiements(id),
  type          TEXT NOT NULL, -- credit | debit | commission | virement
  montant       INT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS: mise à jour note_moyenne automatique
-- ============================================================

CREATE OR REPLACE FUNCTION update_artisan_note()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE artisans SET
    note_moyenne = (
      SELECT COALESCE(AVG(note_globale), 0)
      FROM avis WHERE artisan_id = NEW.artisan_id
    ),
    nb_avis = (
      SELECT COUNT(*) FROM avis WHERE artisan_id = NEW.artisan_id
    ),
    -- Auto-exclusion si note < 3.5
    statut = CASE
      WHEN (SELECT AVG(note_globale) FROM avis WHERE artisan_id = NEW.artisan_id) < 3.5
        AND (SELECT COUNT(*) FROM avis WHERE artisan_id = NEW.artisan_id) >= 5
      THEN 'excluded'::artisan_status
      ELSE statut
    END,
    -- Badge Élite si note >= 4.5 et >= 50 missions
    badge = CASE
      WHEN (SELECT AVG(note_globale) FROM avis WHERE artisan_id = NEW.artisan_id) >= 4.5
        AND nb_missions >= 50
      THEN 'elite'::artisan_badge
      WHEN cin_verifie = TRUE THEN 'verified'::artisan_badge
      ELSE 'none'::artisan_badge
    END,
    updated_at = NOW()
  WHERE id = NEW.artisan_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_note
  AFTER INSERT OR UPDATE ON avis
  FOR EACH ROW EXECUTE FUNCTION update_artisan_note();

-- ============================================================
-- TRIGGER: auto-suspend après 3 signalements
-- ============================================================

CREATE OR REPLACE FUNCTION check_signalements()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM signalements WHERE artisan_id = NEW.artisan_id) >= 3 THEN
    UPDATE artisans SET statut = 'suspended', updated_at = NOW()
    WHERE id = NEW.artisan_id AND statut = 'verified';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_signalements
  AFTER INSERT ON signalements
  FOR EACH ROW EXECUTE FUNCTION check_signalements();

-- ============================================================
-- TRIGGER: nb_missions
-- ============================================================

CREATE OR REPLACE FUNCTION update_nb_missions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut = 'completed' AND OLD.statut != 'completed' THEN
    UPDATE artisans SET
      nb_missions = nb_missions + 1,
      updated_at = NOW()
    WHERE id = NEW.artisan_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_nb_missions
  AFTER UPDATE ON demandes
  FOR EACH ROW EXECUTE FUNCTION update_nb_missions();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;

-- Users: chacun voit son propre profil
CREATE POLICY "users_own" ON users
  FOR ALL USING (auth.uid() = id);

-- Artisans: profil public en lecture, modification uniquement par l'artisan
CREATE POLICY "artisans_public_read" ON artisans
  FOR SELECT USING (statut = 'verified' OR statut = 'excluded' OR auth.uid() = user_id);

CREATE POLICY "artisans_own_update" ON artisans
  FOR UPDATE USING (auth.uid() = user_id);

-- Demandes: client voit ses demandes, artisan voit celles qui lui sont assignées
CREATE POLICY "demandes_client" ON demandes
  FOR ALL USING (auth.uid() = client_id);

CREATE POLICY "demandes_artisan_read" ON demandes
  FOR SELECT USING (
    artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
    OR statut = 'pending'
  );

-- Messages: uniquement sender et receiver
CREATE POLICY "messages_participants" ON messages
  FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Avis: publics en lecture
CREATE POLICY "avis_public_read" ON avis FOR SELECT USING (TRUE);
CREATE POLICY "avis_client_insert" ON avis FOR INSERT WITH CHECK (auth.uid() = client_id);

-- ============================================================
-- INDEXES pour les performances
-- ============================================================

CREATE INDEX idx_artisans_statut ON artisans(statut);
CREATE INDEX idx_artisans_note ON artisans(note_moyenne DESC);
CREATE INDEX idx_artisans_ville ON artisans(ville);
CREATE INDEX idx_artisans_disponible ON artisans(disponible, statut);
CREATE INDEX idx_demandes_client ON demandes(client_id);
CREATE INDEX idx_demandes_artisan ON demandes(artisan_id);
CREATE INDEX idx_demandes_statut ON demandes(statut, created_at DESC);
CREATE INDEX idx_messages_demande ON messages(demande_id, created_at ASC);
CREATE INDEX idx_avis_artisan ON avis(artisan_id, created_at DESC);
CREATE INDEX idx_artisan_categories ON artisan_categories(artisan_id, categorie_id);

-- Full-text search sur artisans
CREATE INDEX idx_artisans_search ON artisans USING gin(
  to_tsvector('french', COALESCE(bio, ''))
);
