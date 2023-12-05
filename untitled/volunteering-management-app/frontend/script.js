document.addEventListener('DOMContentLoaded', function () {
    // Fetch event data from the backend
    fetch('/api/events')
        .then(response => response.json())
        .then(events => {
            console.log(events);
            displayEvents(events);
            updateCountdown(events);
            setInterval(() => updateCountdown(events), 1000)


            const categorySelect = document.getElementById("category-select");
            categorySelect.addEventListener('change', handleCategoryFilterChange);
        })
        .catch(error => console.error('Error fetching events:', error));


    function openGoogleCalendar(eventDate, eventName) {
        const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&dates=${encodeURIComponent(
            eventDate + "/" + eventDate
        )}&text=${encodeURIComponent(eventName)}`;

        window.open(googleCalendarUrl, '_blank');
    }
    function createEventCard(events) { // Add index parameter here
    const eventCard = document.createElement("div");
    eventCard.classList.add("event-card");


    eventCard.innerHTML = `
                <img src="${events.imageUrl}" alt="${events.name}">
                <h2>${events.name}</h2>
                <div class="event-details">
                    <p>Date: ${events.date}</p>
                    <p>Location: ${events.locations}</p>
                    <p>Volunteers Needed: ${events.volunteersNeeded}</p>
                </div>
                <div id="event-details-${'event.name'}" class="event-details-content" style="display: none;">
                    ${events.details}
                </div>
                <a class="more-details-button" href="javascript:void(0);" onclick="toggleEventDetails('${events.name}')">More Details</a>
                <a class="register-button" href="volunteer-registration.html">Register</a>
                
                <div id="countdown-timer-${events.name}" class="countdown-timer"></div>
                <a class="save-date-button" href="javascript:void(0);" onclick="openGoogleCalendar('${events.date}', '${events.name}')">Save Date</a>
                <div class="event-details-container">
                        <div id="event-details-${events.name}" class="event-details-content" style="display: none;">
                            ${events.details}
                        </div>
                        <a class="more-details-button" href="#" onclick="toggleEventDetails(${events.name})">More Details</a>
                    </div>

                    <div class="button-group">
                        
                        <a class="location-button" href="#" onclick="openLocationInMaps('${events.locations}')">View Location</a>
                    </div>
            `;


    return eventCard;
}

    function toggleEventDetails(events) {
       const eventDetailsContent = document.querySelector(`#event-details-${events.name}`);

if (eventDetailsContent.style.display === "none" || eventDetailsContent.style.display === "") {
    eventDetailsContent.style.display = "block";
} else {
    eventDetailsContent.style.display = "none";
}

// Prevent the default anchor behavior
event.preventDefault();
    }


        function updateCountdown(events) {
        const eventDates = events.map((event) => new Date(event.date).getTime());
        const currentDate = new Date().getTime();

        eventDates.forEach((eventDate, index) => {

            const timeRemaining = eventDate - currentDate;
            console.log(timeRemaining);
            const countdownTimer = document.getElementById(`countdown-timer-${events[index].name}`);

            if (timeRemaining > 0) {
                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                countdownTimer.innerHTML = `
                    <div>${days}<span>Days</span></div>
                    <div>${hours}<span>Hours</span></div>
                    <div>${minutes}<span>Minutes</span></div>
                    <div>${seconds}<span>Seconds</span></div>
                `;
            } else{
                countdownTimer.innerHTML = "<p>Event Ended</p>";
            }
        });
    }




    function handleCategoryFilterChange() {
        const categorySelect = document.getElementById("category-select");
        const selectedCategory = categorySelect.value;
        displayEventsByCategory(selectedCategory);
    }
    function openLocationInMaps(location) {



// Construct the Google Maps URL with the location as a query parameter



 const mapsUrl =`https://www.google.com/maps/search/?q=${encodeURIComponent(location)};`

// Open the URL in new tab or window

  window.open(mapsUrl, '_blank');}

    function displayEventsByCategory(category) {
        fetch('/api/events')
            .then(response => response.json())
            .then(events => {
                if (category === "all") {
                    displayEvents(events);
                } else {
                    const filteredEvents = events.filter(event => event.category === category);
                    displayEvents(filteredEvents);
                }
            })
            .catch(error => console.error('Error fetching events:', error));
    }






    function displayEvents(events) {
    const eventsSection = document.getElementById("events");
    eventsSection.innerHTML = "";

    events.forEach(event => {
        const eventCard = createEventCard(event);
        eventsSection.appendChild(eventCard);
    });
}




});
