import HomePage from '@/components/HomePage';
import { render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

describe('HomePage tests', () => {
  const user = userEvent.setup();

  test('should render the HomePage component', () => {
    render(<HomePage />);
    const homePageText = screen.getByText('choosr');
    expect(homePageText).toBeVisible();
  });

  test('should navigate to create when Create decision is pressed', async () => {
    render(<HomePage />);
    const createBtn = screen.getByRole('button', { name: 'Create decision' });
    expect(createBtn).toBeVisible();
    await user.press(createBtn);
    expect(router.push).toHaveBeenCalledWith('/create');
  });
});
