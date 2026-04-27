function calculate() {

    const age = document.getElementById("age").value;
    const weight = document.getElementById("weight").value;
    const height = document.getElementById("height").value;
    const activity = document.getElementById("activity").value;
    const goal = document.getElementById("goal").value;

    fetch(window.location.origin + "/calculate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            age: age,
            weight: weight,
            height: height,
            activity: activity,
            goal: goal
        })
    })
    .then(response => response.json())
    .then(data => {

        let output = `
            <h3>Result</h3>
            <p><strong>BMI:</strong> ${data.bmi}</p>
            <p><strong>Category:</strong> ${data.category}</p>
            <h4>Recommended Foods:</h4>
            <ul>
        `;

        data.foods.forEach(food => {
            output += `<li>${food}</li>`;
        });

        output += "</ul>";

        document.getElementById("result").innerHTML = output;
    })
    .catch(error => {
        document.getElementById("result").innerHTML =
            "<p style='color:red;'>Error connecting to backend!</p>";
    });
}

// Download Recommendations as PDF
function downloadRecommendationsPDF() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    if (!currentUser || !currentUser.email) {
        alert("Please log in first!");
        return;
    }

    const email = currentUser.email;
    const url = `${window.location.origin}/download_recommendations_pdf?email=${encodeURIComponent(email)}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || "Failed to download PDF");
                });
            }
            return response.blob();
        })
        .then(blob => {
            // Create a temporary URL for the blob
            const blobUrl = window.URL.createObjectURL(blob);
            // Create a temporary link element and click it
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `Health_Recommendations_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        })
        .catch(error => {
            console.error("Error downloading PDF:", error);
            alert("Error downloading PDF: " + error.message);
        });
}