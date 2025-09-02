import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssistantChat from '../AssistantChat';

const baseProps = {
    onSendMessage: vi.fn().mockResolvedValue(undefined),
    messages: [],
    isLoading: false,
    onResetAssistant: vi.fn().mockResolvedValue(undefined),
};

describe('AssistantChat', () => {
    it('renders input and Reset button', () => {
        render(<AssistantChat {...baseProps} />);
        expect(screen.getByPlaceholderText('Ask the AI assistant...')).toBeInTheDocument();
        expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('calls onSendMessage and clears input on submit', async () => {
        const onSendMessage = vi.fn().mockResolvedValue(undefined);
        render(<AssistantChat {...baseProps} onSendMessage={onSendMessage} />);

        const input = screen.getByPlaceholderText('Ask the AI assistant...') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Hello' } });

        const form = input.closest('form')!;
        fireEvent.submit(form);

        await waitFor(() => expect(onSendMessage).toHaveBeenCalledWith('Hello'));
        await waitFor(() => expect(input.value).toBe(''));
    });

    it('does not submit when input empty', async () => {
        const onSendMessage = vi.fn().mockResolvedValue(undefined);
        render(<AssistantChat {...baseProps} onSendMessage={onSendMessage} />);

        const input = screen.getByPlaceholderText('Ask the AI assistant...') as HTMLInputElement;
        const form = input.closest('form')!;
        fireEvent.submit(form);

        await new Promise(r => setTimeout(r, 20));
        expect(onSendMessage).not.toHaveBeenCalled();
    });
});


