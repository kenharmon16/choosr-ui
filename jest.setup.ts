jest.mock('expo-router', () => {
  const navigate = jest.fn();
  const push = jest.fn();
  const replace = jest.fn();
  const back = jest.fn();

  return {
    router: {
      navigate,
      push,
      replace,
      back,
    },
    useRouter: () => ({
      navigate,
      push,
      replace,
      back,
    }),
  };
});