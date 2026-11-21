// 1. Публичный проект (для витрины)
export interface ProjectPublic {
    id: string;
    title: string;
    slug: string;
    summary: string;
    description: string | null;
    cover_image: string | null;
    github_url: string | null;
    demo_url: string | null;
    stack: string[];
    is_featured: boolean;
    order: number;
    created_at: string;
}

// 2. Полный проект для админки (со счетчиками)
export interface ProjectAdmin extends ProjectPublic {
    is_published: boolean;
    views_count: number;
    github_clicks: number;
    demo_clicks: number;
    updated_at: string;
}

// 3. Форма создания проекта
export interface ProjectCreateInput {
    title: string;
    slug: string;
    summary: string;
    description?: string;
    cover_image?: string;
    github_url?: string;
    demo_url?: string;
    stack?: string[];
    is_published?: boolean;
    is_featured?: boolean;
    order?: number;
}

// 4. Публичная ачивка
export interface AchievementPublic {
    id: string;
    slug: string;
    title: string;
    description: string;
    secret_description: string | null;
    icon: string;
    is_secret: boolean;
    total_unlocked_count: number;
}

// 5. Ачивка для админки
export interface AchievementAdmin extends AchievementPublic {
    first_unlocked_at: string | null;
    last_unlocked_at: string | null;
    created_at: string;
}

// 6. Лог телеметрии ачивок
export interface AchievementEvent {
    id: number;
    achievement_id: string;
    unlocked_at: string;
    user_agent: string | null;
    ip_hash: string | null;
}