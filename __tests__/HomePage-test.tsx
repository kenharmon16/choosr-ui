import HomePage from '@/components/HomePage';
import { render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

describe('HomePage tests', () => {
    const user = userEvent.setup();

    test("should render the HomePage component", () => {
        render(<HomePage />);
        const homePageText = screen.getByText('choosr');
        expect(homePageText).toBeVisible();
    });

    test('should select the Create Decision button', async () => {
        render(<HomePage />);
        const createDecisionButton = screen.getByRole('button', { name: 'Create Decision'} );
        expect(createDecisionButton).toBeVisible();
        await user.press(createDecisionButton);
        expect(router.navigate).toHaveBeenCalledWith("/decisionSelection");
    });
})