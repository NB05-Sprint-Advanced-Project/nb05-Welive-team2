import { NoticeCategory } from '@prisma/client';
import { NoticesView, NoticeView } from '../dto/notice-view';
import { INoticeQueryRepo } from '../interface/i-notice-query-repo';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { IRedisExternal } from '../../../shared/interface/i-redis';
import { IRedisLocker } from '../../../shared/interface/i-redis-locker';

export const createNoticeQueryService = (
  repo: INoticeQueryRepo,
  redisExternal: IRedisExternal,
  redisLocker: IRedisLocker,
) => {
  const getNotice = async (noticeId: string): Promise<NoticeView> => {
    const notice = await redisLocker.doWork({
      key: `noticeId:${noticeId}`,
      lockKey: `lock:notice:${noticeId}`,
      work: async () => {
        const found = await repo.findById(noticeId);
        if (!found) {
          throw BusinessException({ type: BusinessExceptionType.NOTICE_NOT_FOUND });
        }
        return found;
      },
      cacheTtlSeconds: 60,
    });

    if (!notice) {
      throw BusinessException({ type: BusinessExceptionType.NOTICE_NOT_FOUND });
    }

    const viewsCountKey = `notice:${noticeId}:viewsCount`;
    await redisExternal.setIfNotExist(viewsCountKey, String(notice.viewsCount), 10);
    const newViewsCount = await redisExternal.increase(viewsCountKey);

    const dirtyNoticeKey = `dirty:noticeIds`;
    await redisExternal.addToSet(dirtyNoticeKey, noticeId);

    notice.viewsCount = newViewsCount;
    return notice;
  };

  /*
  캐시 전략
  getAllNotices: 반복되는 기본값 요청 => 대부분의 사용자가 1페이지/전체 카테고리만 조회. 따라서 이것만 캐싱
  getEvents: 현재월이 가장 많이 조회. => 이것만 캐싱
  */

  // todo: 키값들 상수로 빼서 관리
  const getAllNotices = async ({
    page,
    limit,
    searchKeyword,
    category,
  }: {
    page: number;
    limit: number;
    searchKeyword: string;
    category: NoticeCategory | 'ALL';
  }): Promise<NoticesView> => {
    const isDefaultReq = page === 1 && limit === 10 && searchKeyword === '' && category === 'ALL';
    const key = `notices:list:${category}:default`;

    if (isDefaultReq) {
      const cached = await redisExternal.get(key);
      if (cached) return JSON.parse(cached);
    }

    const notices = await repo.findAll(page, limit, searchKeyword, category);

    if (isDefaultReq) {
      await redisExternal.setIfNotExist(key, JSON.stringify(notices), 3);
    }
    return notices;
  };

  const getEvents = async ({
    apartmentId,
    year,
    month,
  }: {
    apartmentId: string;
    year: number;
    month: number;
  }) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const isNowReq = year === currentYear && month === currentMonth;
    const key = `events:list:default`;

    if (isNowReq) {
      const cached = await redisExternal.get(key);
      if (cached) return JSON.parse(cached);
    }

    const events = await repo.findEvents(apartmentId, year, month);
    if (isNowReq) {
      await redisExternal.setIfNotExist(key, JSON.stringify(events), 3);
    }
    return events;
  };

  return { getNotice, getAllNotices, getEvents };
};

export type NoticeQueryService = ReturnType<typeof createNoticeQueryService>;
