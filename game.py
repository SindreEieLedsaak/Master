import random
import numpy as np
import pygame
from collections import deque

import torch
import torch.nn as nn
import torch.optim as optim

# -------------------------
# Game Environment
# -------------------------
class CatchGame:
    def __init__(self, width=400, height=400):
        self.width = width
        self.height = height
        # Basket properties
        self.basket_width = 50
        self.basket_height = 10
        # Ball properties
        self.ball_radius = 10
        self.ball_speed = 5
        self.reset()

    def reset(self):
        # Reset the basket to the middle of the bottom
        self.basket_x = self.width // 2
        self.basket_y = self.height - self.basket_height
        # Spawn the ball at a random x at the top
        self.ball_x = random.randint(self.ball_radius, self.width - self.ball_radius)
        self.ball_y = 0
        self.done = False
        return self.get_state()

    def get_state(self):
        # Normalize positions to be between 0 and 1
        return np.array([
            self.basket_x / self.width,
            self.ball_x / self.width,
            self.ball_y / self.height
        ], dtype=np.float32)

    def step(self, action):
        """
        Action:
          0 -> Move Left
          1 -> Stay
          2 -> Move Right
        """
        move_amount = 10
        if action == 0:
            self.basket_x -= move_amount
        elif action == 2:
            self.basket_x += move_amount
        # Keep the basket within the screen boundaries.
        self.basket_x = max(self.basket_width // 2, min(self.width - self.basket_width // 2, self.basket_x))

        # Update the ball's position (falls down)
        self.ball_y += self.ball_speed

        reward = 0
        # If the ball has reached the height of the basket, decide if it was caught.
        if self.ball_y + self.ball_radius >= self.basket_y:
            if abs(self.ball_x - self.basket_x) < self.basket_width / 2:
                reward = 1  # Caught!
            else:
                reward = -1  # Missed!
            self.done = True

        # If the ball somehow goes off the bottom, end the episode.
        if self.ball_y > self.height:
            self.done = True

        return self.get_state(), reward, self.done

    def render(self, screen):
        # Fill background with white
        screen.fill((255, 255, 255))
        # Draw the basket (blue rectangle)
        basket_rect = pygame.Rect(
            self.basket_x - self.basket_width // 2,
            self.basket_y,
            self.basket_width,
            self.basket_height
        )
        pygame.draw.rect(screen, (0, 0, 255), basket_rect)
        # Draw the falling ball (red circle)
        pygame.draw.circle(screen, (255, 0, 0), (int(self.ball_x), int(self.ball_y)), self.ball_radius)
        pygame.display.flip()

# -------------------------
# Deep Q-Network (DQN)
# -------------------------
class DQN(nn.Module):
    def __init__(self, state_size, action_size, hidden_size=64):
        super(DQN, self).__init__()
        self.fc1 = nn.Linear(state_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.fc3 = nn.Linear(hidden_size, action_size)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

# -------------------------
# Agent using DQN
# -------------------------
class Agent:
    def __init__(self,
                 state_size,
                 action_size,
                 lr=1e-3,
                 gamma=0.99,
                 epsilon_start=1.0,
                 epsilon_end=0.01,
                 epsilon_decay=0.995,
                 memory_size=10000,
                 batch_size=64):
        self.state_size = state_size
        self.action_size = action_size
        self.memory = deque(maxlen=memory_size)
        self.batch_size = batch_size
        self.gamma = gamma

        # Epsilon for the epsilon-greedy policy
        self.epsilon = epsilon_start
        self.epsilon_end = epsilon_end
        self.epsilon_decay = epsilon_decay

        # DQN network, optimizer, and loss
        self.model = DQN(state_size, action_size)
        self.optimizer = optim.Adam(self.model.parameters(), lr=lr)
        self.loss_fn = nn.MSELoss()

    def get_action(self, state):
        # Epsilon-greedy action selection
        if random.random() < self.epsilon:
            return random.randint(0, self.action_size - 1)
        else:
            state_tensor = torch.FloatTensor(state).unsqueeze(0)
            with torch.no_grad():
                q_values = self.model(state_tensor)
            return q_values.argmax().item()

    def store_transition(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))

    def train_step(self):
        if len(self.memory) < self.batch_size:
            return  # Not enough data yet

        # Sample a mini-batch from memory
        batch = random.sample(self.memory, self.batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)

        states      = torch.FloatTensor(np.array(states))
        actions     = torch.LongTensor(actions).unsqueeze(1)
        rewards     = torch.FloatTensor(rewards).unsqueeze(1)
        next_states = torch.FloatTensor(np.array(next_states))
        dones       = torch.FloatTensor(dones).unsqueeze(1)

        # Compute Q values for current states
        current_q = self.model(states).gather(1, actions)

        # Compute Q values for next states and derive targets
        next_q = self.model(next_states).max(1)[0].unsqueeze(1)
        target_q = rewards + (1 - dones) * self.gamma * next_q

        loss = self.loss_fn(current_q, target_q)

        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        # Decay epsilon
        self.epsilon = max(self.epsilon_end, self.epsilon * self.epsilon_decay)

# -------------------------
# Training Loop
# -------------------------
def train_agent(num_episodes=500):
    env = CatchGame()
    state_size = 3   # basket_x, ball_x, ball_y (all normalized)
    action_size = 3  # 0: left, 1: stay, 2: right
    agent = Agent(state_size, action_size)

    scores = []
    for e in range(num_episodes):
        state = env.reset()
        total_reward = 0
        done = False

        while not done:
            action = agent.get_action(state)
            next_state, reward, done = env.step(action)
            agent.store_transition(state, action, reward, next_state, done)
            agent.train_step()
            state = next_state
            total_reward += reward

        scores.append(total_reward)
        print(f"Episode {e+1}/{num_episodes} - Score: {total_reward}, Epsilon: {agent.epsilon:.2f}")

    return agent, scores

# -------------------------
# Visualize Trained Agent
# -------------------------
def play_trained_agent(agent, num_episodes=5):
    env = CatchGame()
    pygame.init()
    screen = pygame.display.set_mode((env.width, env.height))
    clock = pygame.time.Clock()

    for e in range(num_episodes):
        state = env.reset()
        done = False
        while not done:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    return

            # Use the trained policy (epsilon is low after training)
            action = agent.get_action(state)
            state, reward, done = env.step(action)
            env.render(screen)
            clock.tick(30)  # Run at 30 frames per second

        # Pause a moment between episodes
        pygame.time.wait(1000)

    pygame.quit()

# -------------------------
# Main: Train and then watch the agent play
# -------------------------
if __name__ == '__main__':
    print("Training the agent...")
    trained_agent, scores = train_agent(num_episodes=500)
    print("Training complete. Now watching the trained agent play...")
    play_trained_agent(trained_agent, num_episodes=5)
