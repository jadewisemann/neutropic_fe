export const dummyCommunityPosts = [
  {
    id: 'dummy-thread-1',
    title: '아침 루틴에 비타민 D를 넣어봤어요',
    content:
      '출근 전에 챙기기 쉽게 식탁 위에 두니까 까먹는 날이 확 줄었어요. 햇빛을 많이 못 보는 날에는 컨디션 차이가 조금 느껴집니다.',
    author: {
      id: 'dummy-user-1',
      username: 'sunny_routine',
    },
    created_at: '2026-06-23T08:30:00+09:00',
    like_count: 18,
    comment_count: 6,
    is_liked: false,
  },
  {
    id: 'dummy-thread-2',
    title: '마그네슘은 저녁에 먹는 게 더 편하네요',
    content:
      '처음에는 아침에 먹었는데 속이 살짝 불편해서 저녁 식후로 바꿨어요. 개인차가 있겠지만 저는 잠들기 전 루틴으로 붙이니 더 꾸준해졌습니다.',
    author: {
      id: 'dummy-user-2',
      username: 'night_care',
    },
    created_at: '2026-06-22T21:14:00+09:00',
    like_count: 31,
    comment_count: 12,
    is_liked: true,
  },
  {
    id: 'dummy-thread-3',
    title: '오메가3 비린 맛 줄이는 팁 있나요?',
    content:
      '냉장 보관하면 낫다는 이야기를 들었는데 실제로 효과가 있는지 궁금해요. 캡슐 크기도 커서 다른 제품으로 바꿔볼까 고민 중입니다.',
    author: {
      id: 'dummy-user-3',
      username: 'clean_label',
    },
    created_at: '2026-06-21T13:05:00+09:00',
    like_count: 9,
    comment_count: 15,
    is_liked: false,
  },
  {
    id: 'dummy-thread-4',
    title: '프로바이오틱스는 식전/식후 언제 드세요?',
    content:
      '제품마다 안내가 달라서 헷갈리네요. 저는 아침 공복에 먹고 있는데, 꾸준히 먹는 분들은 어떤 방식이 가장 편했는지 궁금합니다.',
    author: {
      id: 'dummy-user-4',
      username: 'daily_balance',
    },
    created_at: '2026-06-20T10:42:00+09:00',
    like_count: 24,
    comment_count: 8,
    is_liked: false,
  },
]

export const dummyCommunityComments = {
  'dummy-thread-1': [
    {
      id: 'dummy-comment-1-1',
      content: '저도 알람보다 눈에 보이는 위치에 두는 게 제일 효과 좋았어요.',
      author: { id: 'dummy-user-5', username: 'habit_maker' },
      created_at: '2026-06-23T09:05:00+09:00',
      replies: [],
    },
    {
      id: 'dummy-comment-1-2',
      content: '식후에 챙기면 속도 편해서 루틴으로 붙이기 좋더라고요.',
      author: { id: 'dummy-user-6', username: 'meal_note' },
      created_at: '2026-06-23T09:22:00+09:00',
      replies: [],
    },
  ],
  'dummy-thread-2': [
    {
      id: 'dummy-comment-2-1',
      content: '저녁 식후로 바꾸고 나서 저도 훨씬 꾸준히 먹게 됐어요.',
      author: { id: 'dummy-user-7', username: 'sleep_well' },
      created_at: '2026-06-22T22:01:00+09:00',
      replies: [],
    },
  ],
  'dummy-thread-3': [
    {
      id: 'dummy-comment-3-1',
      content: '냉장 보관하면 비린 향이 덜 올라오는 느낌은 있었어요.',
      author: { id: 'dummy-user-8', username: 'omega_tip' },
      created_at: '2026-06-21T14:18:00+09:00',
      replies: [],
    },
  ],
  'dummy-thread-4': [
    {
      id: 'dummy-comment-4-1',
      content: '제품 라벨 권장 섭취법을 우선 보고, 없으면 같은 시간에 먹는 쪽으로 정착했어요.',
      author: { id: 'dummy-user-9', username: 'label_reader' },
      created_at: '2026-06-20T11:10:00+09:00',
      replies: [],
    },
  ],
}

export function findDummyCommunityPost(postId) {
  return dummyCommunityPosts.find((post) => String(post.id) === String(postId)) ?? null
}

export function getDummyCommunityComments(postId) {
  return dummyCommunityComments[String(postId)] ?? []
}
