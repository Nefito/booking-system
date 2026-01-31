CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE day_of_week as ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
CREATE TYPE rule_type as ENUM ('read', 'write', 'delete');
CREATE TYPE email_type as ENUM ('booking_confirmation', 'booking_reminder', 'cancellation_confirmation', 'reschedule_confirmation', 'welcome_email', 'password_reset');
CREATE TYPE resource_status as ENUM ('active', 'inactive');
CREATE TYPE booking_status as ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE blockout_reason as ENUM ('maintenance', 'private_event', 'holiday', 'other');
CREATE TYPE availability_overrides_reason as ENUM ('extended_hours', 'early_closure', 'special_event', 'holiday_hours', 'other');
CREATE TYPE booking_action as ENUM ('create', 'update', 'cancel', 'reschedule', 'status_change', 'refund_issued', 'payment_processed');
CREATE TYPE email_status as ENUM ('pending', 'sent', 'failed', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed');

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(16) NOT NULL UNIQUE,
    rules rule_type[] NOT NULL DEFAULT ARRAY['read'],

    created_at TIMESTAMPZ NOT NULL DEFAULT NOW(),
)

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(64) NOT NULL UNIQUE,

    created_at TIMESTAMPZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPZ,
    deleted_at TIMESTAMPZ,
)

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,
    email VARCHAR(250) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(250) NOT NULL,

    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,

    created_at TIMESTAMPZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPZ,
    deleted_at TIMESTAMPZ,
)

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(250) NOT NULL,
    description TEXT,
    status resource_status NOT NULL DEFAULT 'active',
    image_url VARCHAR(250),
    duration_minutes INT NOT NULL DEFAULT 60,
    operating_start TIME NOT NULL DEFAULT '09:00:00',
    operating_end TIME NOT NULL DEFAULT '18:00:00',
    available_days day_of_week[] NOT NULL DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    capacity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    buffer_time_minutes INT NOT NULL DEFAULT 15,

    created_at TIMESTAMPZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPZ,
    deleted_at TIMESTAMPZ,

    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

)

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status booking_status NOT NULL DEFAULT 'pending',
    confirmation_code VARCHAR(8) NOT NULL UNIQUE,
    start_time TIMESTAMPZ NOT NULL,
    end_time TIMESTAMPZ NOT NULL,
    notes TEXT,

    created_at TIMESTAMPZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPZ,
    deleted_at TIMESTAMPZ,

    user_id UUID REFERENCES users(id) NOT NULL ON DELETE SET CASCADE,
    -- UNCOMMENT THIS WHEN WE NEED TO OPTIMIZE THE DATABASE PERFORMANCE
    -- user_name VARCHAR(130) NOT NULL,
    -- user_email VARCHAR(250) NOT NULL UNIQUE,
    -- user_phone VARCHAR(20) UNIQUE,

    resource_id UUID REFERENCES resources(id) NOT NULL ON DELETE SET CASCADE,
    -- UNCOMMENT THIS WHEN WE NEED TO OPTIMIZE THE DATABASE PERFORMANCE
    -- resource_name VARCHAR(250) NOT NULL,
    -- resource_category VARCHAR(64) NOT NULL,
    -- resource_price DECIMAL(10, 2) NOT NULL,
)

CREATE TABLE blockout_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    start_date TIMESTAMPZ NOT NULL,
    end_date TIMESTAMPZ NOT NULL,
    reason blockout_reason NOT NULL DEFAULT 'maintenance',
    title VARCHAR(200) NOT NULL,
    description TEXT,

    created_at TIMESTAMPZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPZ,

    created_by UUID REFERENCES users(id) NOT NULL ON DELETE SET CASCADE,
    resource_id UUID REFERENCES resources(id) NOT NULL ON DELETE SET CASCADE,
)

CREATE TABLE availability_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    start_date TIMESTAMPZ NOT NULL,
    end_date TIMESTAMPZ NOT NULL,
    available_days day_of_week[] NOT NULL DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    reason availability_overrides_reason NOT NULL DEFAULT 'extended_hours',
    title VARCHAR(200) NOT NULL,
    description TEXT,

    created_at TIMESTAMPZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPZ,

    created_by UUID REFERENCES users(id) NOT NULL ON DELETE SET CASCADE,
    resource_id UUID REFERENCES resources(id) NOT NULL ON DELETE SET CASCADE,
)

CREATE TABLE book_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action booking_action NOT NULL DEFAULT 'create',
    old_values JSONB NOT NULL,
    new_values JSONB NOT NULL,
    changed_fields text[] NOT NULL,

    created_at TIMESTAMPZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPZ,

    booking_id UUID REFERENCES bookings(id) NOT NULL ON DELETE SET CASCADE,

    user_id UUID REFERENCES users(id) NOT NULL ON DELETE SET CASCADE,
    -- UNCOMMENT THIS WHEN WE NEED TO OPTIMIZE THE DATABASE PERFORMANCE
    -- user_name VARCHAR(130) NOT NULL,
    -- user_email VARCHAR(250) NOT NULL,

    role_id UUID REFERENCES roles(id) NOT NULL ON DELETE SET CASCADE,
    -- UNCOMMENT THIS WHEN WE NEED TO OPTIMIZE THE DATABASE PERFORMANCE
    -- role_name VARCHAR(16) NOT NULL,
)

CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_type email_type NOT NULL,
    subject VARCHAR(500) NOT NULL,
    from_email VARCHAR(250) NOT NULL,
    from_name VARCHAR(130) NOT NULL,
    status email_status NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMPZ NOT NULL,
    delivered_at TIMESTAMPZ,
    opened_at TIMESTAMPZ,
    clicked_at TIMESTAMPZ,
    bounced_at TIMESTAMPZ,
    failed_at TIMESTAMPZ,
    error_message TEXT,
    bounced_reason TEXT,
    bounced_type VARCHAR(20) NOT NULL DEFAULT 'hard' CHECK (bounced_type IN ('hard', 'soft')),
    provider VARCHAR(50) NOT NULL,
    provider_message_id VARCHAR(255) NOT NULL,

    created_at TIMESTAMPZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPZ,

    recipient_id UUID REFERENCES users(id) NOT NULL ON DELETE SET CASCADE,
    -- UNCOMMENT THIS WHEN WE NEED TO OPTIMIZE THE DATABASE PERFORMANCE
    -- recipient_email VARCHAR(250) NOT NULL,
    -- recipient_name VARCHAR(130) NOT NULL,

    booking_id UUID REFERENCES bookings(id) NOT NULL ON DELETE SET CASCADE,
)

CREATE TABLE email_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_type email_type NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMPZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPZ,

    user_id UUID REFERENCES users(id) NOT NULL ON DELETE SET CASCADE,
)