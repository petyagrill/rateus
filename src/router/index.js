import {createRouter, createWebHistory} from 'vue-router'

// Auth views
import Login from '@/views/auth/LoginView.vue'
import Register from '@/views/auth/RegisterView.vue'
import ForgotPassword from '@/views/auth/ForgotPasswordView.vue'
import ResetPassword from '@/views/auth/ResetPasswordView.vue'

// Dashboard views
import Dashboard from '@/views/dashboard/DashboardView.vue'
import SurveyList from '@/views/surveys/SurveyListView.vue'
import SurveyCreate from '@/views/surveys/SurveyCreateView.vue'
import SurveyEdit from '@/views/surveys/SurveyEditView.vue'
import SurveyPreview from '@/views/surveys/SurveyPreviewView.vue'
import ResponseList from '@/views/responses/ResponseListView.vue'
import ResponseDetails from '@/views/responses/ResponseDetailsView.vue'
import Analytics from '@/views/analytics/AnalyticsView.vue'
import Profile from '@/views/profile/ProfileView.vue'
import Settings from '@/views/settings/SettingsView.vue'

// Public survey views
import SurveyPublic from '@/views/public/SurveyPublicView.vue'
import SurveyThankYou from '@/views/public/SurveyThankYouView.vue'

const routes = [
    // Auth routes
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: {
            layout: 'auth',
            public: true,
            title: 'Login'
        }
    },
    {
        path: '/register',
        name: 'register',
        component: Register,
        meta: {
            layout: 'auth',
            public: true,
            title: 'Register'
        }
    },
    {
        path: '/forgot-password',
        name: 'forgot-password',
        component: ForgotPassword,
        meta: {
            layout: 'auth',
            public: true,
            title: 'Forgot Password'
        }
    },
    {
        path: '/reset-password/:token',
        name: 'reset-password',
        component: ResetPassword,
        meta: {
            layout: 'auth',
            public: true,
            title: 'Reset Password'
        }
    },

    // Dashboard routes
    {
        path: '/',
        redirect: '/dashboard'
    }, {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: {
            title: 'Dashboard'
        }
    },
    {
        path: '/surveys',
        name: 'surveys',
        component: SurveyList,
        meta: {
            title: 'My Surveys'
        }
    },
    {
        path: '/surveys/create',
        name: 'survey-create',
        component: SurveyCreate,
        meta: {
            title: 'Create Survey'
        }
    },
    {
        path: '/surveys/:id/edit',
        name: 'survey-edit',
        component: SurveyEdit,
        meta: {
            title: 'Edit Survey'
        }
    },
    {
        path: '/surveys/:id/preview',
        name: 'survey-preview',
        component: SurveyPreview,
        meta: {
            title: 'Preview Survey'
        }
    },
    {
        path: '/responses',
        name: 'responses',
        component: ResponseList,
        meta: {
            title: 'Responses'
        }
    },
    {
        path: '/responses/:id',
        name: 'response-details',
        component: ResponseDetails,
        meta: {
            title: 'Response Details'
        }
    },
    {
        path: '/analytics',
        name: 'analytics',
        component: Analytics,
        meta: {
            title: 'Analytics'
        }
    },
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: {
            title: 'My Profile'
        }
    },
    {
        path: '/settings',
        name: 'settings',
        component: Settings,
        meta: {
            title: 'Settings'
        }
    },

    // Public survey routes
    {
        path: '/s/:surveyId',
        name: 'survey-public',
        component: SurveyPublic,
        meta: {
            layout: 'survey',
            public: true,
            title: 'Survey'
        }
    },
    {
        path: '/s/:surveyId/thank-you',
        name: 'survey-thank-you',
        component: SurveyThankYou,
        meta: {
            layout: 'survey',
            public: true,
            title: 'Thank You'
        }
    },

    // 404 route
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
        meta: {
            public: true,
            title: 'Page Not Found'
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return {top: 0}
        }
    }
})

// Navigation guards
router.beforeEach((to, from, next) => {
    // Set document title
    document.title = to.meta.title
        ? `${to.meta.title} | RateUS`
        : 'RateUS - Rate.Rise.Grow'

    // Check auth (will be handled in App.vue)
    next()
})

export default router