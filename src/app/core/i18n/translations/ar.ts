import type { TranslationDictionary } from '../translation.model';
import type { TranslationKey } from './en';

/**
 * Arabic — the secondary language. Typed as `Record<TranslationKey, ...>`
 * (not `as const satisfies` like en.ts) specifically so it's *required* to
 * cover every key `en.ts` defines: add a key to `en.ts` and forget it here,
 * and this file fails to compile instead of silently falling back to
 * English at runtime for that one string.
 *
 * Plural forms use real Arabic grammatical categories (zero/one/two/few/
 * many/other — Arabic distinguishes all six, unlike English's two), and
 * drop the redundant "واحد/واحدة" (a bare "دقيقة" already means "a minute" —
 * repeating "one" reads as stilted, machine-translated Arabic, the same way
 * "1 day(s)" would in English). Dual and plural nouns following a
 * preposition (خلال، منذ، بـ) take the genitive/accusative dual ending
 * (يومين), not the nominative (يومان) — grammatically correct here, not
 * interchangeable.
 */
export const ar: Record<TranslationKey, TranslationDictionary[string]> = {
  'app.title': 'مدير المهام',

  'nav.main': 'الرئيسية',
  'nav.dashboard': 'لوحة التحكم',
  'nav.tasks': 'المهام',
  'nav.calendar': 'التقويم',
  'nav.analytics': 'التحليلات',
  'nav.team': 'الفريق',
  'nav.settings': 'الإعدادات',
  'nav.skipToMainContent': 'الانتقال إلى المحتوى الرئيسي',

  'common.newTask': 'مهمة جديدة',
  'common.cancel': 'إلغاء',
  'common.confirm': 'تأكيد',
  'common.delete': 'حذف',
  'common.edit': 'تعديل',
  'common.save': 'حفظ',
  'common.add': 'إضافة',
  'common.completed': 'مكتمل',

  'header.menuToggle': 'تبديل قائمة التنقل',
  'header.searchPlaceholder': 'ابحث عن المهام...',
  'header.searchLabel': 'البحث عن المهام',
  'header.notifications': 'الإشعارات',
  'header.language': 'اللغة',

  'dashboard.loadError': 'تعذّر تحميل مهامك. يُرجى التحقق من اتصالك والمحاولة مرة أخرى.',
  'dashboard.retry': 'إعادة المحاولة',
  'dashboard.loadingBoard': 'جارٍ تحميل لوحة التحكم',

  'board.regionLabel': 'عمود {title}',
  'board.empty': 'لا توجد مهام هنا.',

  'status.todo': 'قيد الانتظار',
  'status.inProgress': 'قيد التنفيذ',
  'status.done': 'منجز',

  'toolbar.statusFilterLabel': 'تصفية حسب الحالة',
  'toolbar.statusAll': 'الكل',
  'toolbar.assigneeLabel': 'المكلَّف',
  'toolbar.assigneeAll': 'كل المكلَّفين',

  'priority.label': 'الأولوية',
  'priority.all': 'كل الأولويات',
  'priority.high': 'مرتفعة',
  'priority.medium': 'متوسطة',
  'priority.low': 'منخفضة',

  'task.moreActions': 'مزيد من الإجراءات لـ {title}',
  'task.titleFor': 'العنوان لـ {title}',
  'task.descriptionFor': 'الوصف لـ {title}',
  'task.unassigned': 'غير مُكلَّف',

  'dueDate.dueToday': 'يستحق اليوم',
  'dueDate.dueTomorrow': 'يستحق غدًا',
  'dueDate.dueInDays': {
    one: 'يستحق خلال يوم',
    two: 'يستحق خلال يومين',
    few: 'يستحق خلال {count} أيام',
    many: 'يستحق خلال {count} يومًا',
    other: 'يستحق خلال {count} يوم',
  },
  'dueDate.overdueBy': {
    one: 'متأخر بيوم',
    two: 'متأخر بيومين',
    few: 'متأخر بـ {count} أيام',
    many: 'متأخر بـ {count} يومًا',
    other: 'متأخر بـ {count} يوم',
  },
  'dueDate.completedToday': 'اكتمل اليوم',
  'dueDate.completedYesterday': 'اكتمل أمس',

  'taskForm.titleLabel': 'العنوان',
  'taskForm.titleRequired': 'العنوان مطلوب.',
  'taskForm.titleMinLength': 'يجب ألا يقل العنوان عن 3 أحرف.',
  'taskForm.titleMaxLength': 'يجب ألا يتجاوز العنوان 120 حرفًا.',
  'taskForm.descriptionLabel': 'الوصف',
  'taskForm.descriptionRequired': 'الوصف مطلوب.',
  'taskForm.descriptionMinLength': 'يجب ألا يقل الوصف عن 10 أحرف.',
  'taskForm.descriptionMaxLength': 'يجب ألا يتجاوز الوصف 500 حرف.',
  'taskForm.statusLabel': 'الحالة',
  'taskForm.dueDateLabel': 'تاريخ الاستحقاق',
  'taskForm.dueDateRequired': 'تاريخ الاستحقاق مطلوب.',
  'taskForm.dueDatePast': 'لا يمكن أن يكون تاريخ الاستحقاق في الماضي.',
  'taskForm.assigneeRequired': 'يُرجى اختيار مُكلَّف.',
  'taskForm.tagsLegend': 'الوسوم',
  'taskForm.removeTag': 'إزالة الوسم {tag}',
  'taskForm.addTagLabel': 'إضافة وسم',
  'taskForm.maxTags': 'يمكنك إضافة 5 وسوم كحد أقصى.',
  'taskForm.createSubmit': 'إنشاء المهمة',
  'taskForm.saveSubmit': 'حفظ التغييرات',

  'taskFormDialog.editTitle': 'تعديل المهمة',
  'taskFormDialog.newTitle': 'مهمة جديدة',

  'confirmDialog.deleteTitle': 'حذف المهمة؟',
  'confirmDialog.deleteMessage': 'هل تريد حذف "{title}"؟ لا يمكن التراجع عن هذا الإجراء.',

  'notification.taskCreated': 'تم إنشاء المهمة.',
  'notification.taskUpdated': 'تم تحديث المهمة.',

  'error.network': 'تعذّر الوصول إلى الخادم. تحقّق من اتصالك وحاول مرة أخرى.',
  'error.notFound': 'تعذّر العثور على العنصر المطلوب.',
  'error.validation': 'الطلب غير صالح.',
  'error.server': 'حدث خطأ في الخادم. يُرجى المحاولة مرة أخرى بعد قليل.',
  'error.unknown': 'حدث خطأ غير متوقع.',

  'analytics.tasksByPriority': 'المهام حسب الأولوية',
  'analytics.tasksByStatus': 'المهام حسب الحالة',
  'analytics.recentActivity': 'النشاط الأخير',
  'analytics.chartSrItem': {
    zero: '{label}: 0 مهمة',
    one: '{label}: مهمة واحدة',
    two: '{label}: مهمتان',
    few: '{label}: {count} مهام',
    many: '{label}: {count} مهمة',
    other: '{label}: {count} مهمة',
  },

  'activity.created': 'أنشأتَ',
  'activity.updated': 'حدّثتَ',
  'activity.moved': 'نقلتَ',
  'activity.completed': 'أكملتَ',
  'activity.deleted': 'حذفتَ',
  'activity.empty': 'لا يوجد نشاط حديث.',

  'time.justNow': 'الآن',
  'time.minutesAgo': {
    one: 'منذ دقيقة',
    two: 'منذ دقيقتين',
    few: 'منذ {count} دقائق',
    many: 'منذ {count} دقيقة',
    other: 'منذ {count} دقيقة',
  },
  'time.hoursAgo': {
    one: 'منذ ساعة',
    two: 'منذ ساعتين',
    few: 'منذ {count} ساعات',
    many: 'منذ {count} ساعة',
    other: 'منذ {count} ساعة',
  },
  'time.daysAgo': {
    one: 'منذ يوم',
    two: 'منذ يومين',
    few: 'منذ {count} أيام',
    many: 'منذ {count} يومًا',
    other: 'منذ {count} يوم',
  },
  'time.weeksAgo': {
    one: 'منذ أسبوع',
    two: 'منذ أسبوعين',
    few: 'منذ {count} أسابيع',
    many: 'منذ {count} أسبوعًا',
    other: 'منذ {count} أسبوع',
  },

  'team.loading': 'جارٍ تحميل الفريق…',
  'team.empty': 'لا يوجد أعضاء في الفريق بعد.',
  'team.taskCount': {
    zero: '0 مهمة',
    one: 'مهمة واحدة',
    two: 'مهمتان',
    few: '{count} مهام',
    many: '{count} مهمة',
    other: '{count} مهمة',
  },

  'placeholder.comingSoon': 'قريبًا.',
  'placeholder.notFoundTitle': 'الصفحة غير موجودة',

  'stat.totalTasks': 'إجمالي المهام',
  'stat.overdue': 'متأخرة',
  'stat.changeThisWeek': 'هذا الأسبوع',
  'stat.changeToday': 'اليوم',
  'stat.changeSameAsYesterday': 'كالأمس',
};
