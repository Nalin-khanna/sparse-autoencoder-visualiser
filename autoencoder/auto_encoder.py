import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
import matplotlib.pyplot as plt

class SparseAutoEncoder(nn.Module):
    def __init__(self, input_dim, hidden_dim):

        super(SparseAutoEncoder, self).__init__()
        self.encoder = nn.Linear(input_dim, hidden_dim)#input dimension and hidden dimension
        self.decoder = nn.Linear(hidden_dim, input_dim)
        self.activation = nn.ReLU()  # Non-linear activation function
    def forward(self, x):
        # Encoding 
        encoded = self.activation(self.encoder(x))
        # Decoding 
        reconstructed = self.decoder(encoded)
        return reconstructed, encoded     
    

def kl_divergence(rho_hat, rho):
    rho_hat = torch.clamp(rho_hat, 1e-10, 1-1e-5)
    kl = rho * torch.log(rho / rho_hat) + (1 - rho) * torch.log((1 - rho) / (1 - rho_hat))
    return torch.sum(kl)
transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5,), (0.5,))])
train_dataset = datasets.MNIST(root='./data', train=True, transform=transform, download=True)
train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
# Hyperparameters
input_dim = 28 * 28  # Flattened MNIST image size
hidden_dim = 128     # Size of the hidden layer
sparsity_param = 0.05  # Desired sparsity level
beta = 0.1              # Weight for the sparsity penalty
learning_rate = 0.0001
epochs = 10

# Initialize model, loss, and optimizer
model = SparseAutoEncoder(input_dim=input_dim, hidden_dim=hidden_dim)
criterion = nn.MSELoss()  # Reconstruction loss
optimizer = optim.Adam(model.parameters(), lr=learning_rate) 
# Training Loop
for epoch in range(epochs):
    total_loss = 0.0
    sparsity_loss = 0.0
    reconstruction_loss = 0.0

    for images, _ in train_loader:
        # Flatten images
        images = images.view(-1, input_dim)
        
        # Forward pass
        reconstructed, encoded = model(images)
        
        # Calculate losses
        loss_reconstruction = criterion(reconstructed, images)
        rho_hat = torch.mean(encoded, dim=0)  # Average activation per neuron
        loss_sparsity = kl_divergence(rho_hat, sparsity_param)
        
        # Total loss
        loss = loss_reconstruction + beta * loss_sparsity

        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        # Update metrics
        total_loss += loss.item()
        reconstruction_loss += loss_reconstruction.item()
        sparsity_loss += loss_sparsity.item()

    print(f"Epoch [{epoch+1}/{epochs}], Total Loss: {total_loss:.4f}, "
          f"Reconstruction Loss: {reconstruction_loss:.4f}, Sparsity Loss: {sparsity_loss:.4f}")

# Save the model
torch.save(model.state_dict(), "sparse_autoencoder.pth")
# Evaluation
model.eval()
with torch.no_grad():
    # Get a batch of test images
    sample_images, _ = next(iter(train_loader))
    sample_images = sample_images.view(-1, input_dim)
    reconstructed, _ = model(sample_images)

    # Visualize original and reconstructed images
    original = sample_images.view(-1, 28, 28).numpy()
    reconstructed = reconstructed.view(-1, 28, 28).numpy()

    fig, axes = plt.subplots(2, 10, figsize=(12, 4))
    for i in range(10):
        # Original images
        axes[0, i].imshow(original[i], cmap="gray")
        axes[0, i].axis("off")
        
        # Reconstructed images
        axes[1, i].imshow(reconstructed[i], cmap="gray")
        axes[1, i].axis("off")

    plt.suptitle("Original Images (Top) vs Reconstructed Images (Bottom)")
    plt.show()