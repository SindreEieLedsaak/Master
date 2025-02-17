import pygame
import random

# Game constants
WIDTH = 400
HEIGHT = 400
BASKET_WIDTH = 50
BASKET_HEIGHT = 10
BALL_RADIUS = 10
BALL_SPEED = 5
BASKET_SPEED = 10

def main():
    # Initialize Pygame and set up the display
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Catch the Falling Ball")
    clock = pygame.time.Clock()

    # Initial positions for the basket and the ball
    basket_x = WIDTH // 2
    basket_y = HEIGHT - BASKET_HEIGHT
    ball_x = random.randint(BALL_RADIUS, WIDTH - BALL_RADIUS)
    ball_y = 0

    score = 0  # Track the player's score

    running = True
    while running:
        clock.tick(30)  # Run at 30 frames per second
        
        # Process events (including closing the window)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        # Handle key presses for basket movement
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            basket_x -= BASKET_SPEED
        if keys[pygame.K_RIGHT]:
            basket_x += BASKET_SPEED

        # Keep the basket within the screen boundaries
        basket_x = max(BASKET_WIDTH // 2, min(WIDTH - BASKET_WIDTH // 2, basket_x))

        # Update the ball's position (falling down)
        ball_y += BALL_SPEED

        # Check if the ball has reached the basket level
        if ball_y + BALL_RADIUS >= basket_y:
            # Check for collision (if the ball is within the basket's horizontal range)
            if abs(ball_x - basket_x) <= BASKET_WIDTH // 2:
                score += 1
                print("Caught! Score:", score)
            else:
                score -= 1
                print("Missed! Score:", score)
            # Reset the ball to the top with a new random horizontal position
            ball_x = random.randint(BALL_RADIUS, WIDTH - BALL_RADIUS)
            ball_y = 0

        # Draw everything on the screen
        screen.fill((255, 255, 255))  # White background

        # Draw the basket as a blue rectangle
        basket_rect = pygame.Rect(basket_x - BASKET_WIDTH // 2, basket_y, BASKET_WIDTH, BASKET_HEIGHT)
        pygame.draw.rect(screen, (0, 0, 255), basket_rect)

        # Draw the ball as a red circle
        pygame.draw.circle(screen, (255, 0, 0), (ball_x, ball_y), BALL_RADIUS)

        pygame.display.flip()  # Update the full display

    pygame.quit()

if __name__ == "__main__":
    main()
