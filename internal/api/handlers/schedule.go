package handlers

import (
	"encoding/json"
	"net/http"
	"sort"
	"time"

	ics "github.com/arran4/golang-ical"
)

type F1Event struct {
	Summary  string    `json:"summary"`
	Location string    `json:"location"`
	Start    time.Time `json:"start"`
	End      time.Time `json:"end"`
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func F1CalendarHandler(w http.ResponseWriter, r *http.Request) {

	enableCORS(w)
	url := "https://ics.ecal.com/ecal-sub/660897ca63f9ca0008bcbea6/Formula%201.ics"

	cal, err := ics.ParseCalendarFromUrl(url)
	if err != nil {
		http.Error(w, "failed to parse the calendar", http.StatusInternalServerError)
		return
	}

	var events []F1Event
	for _, event := range cal.Events() {

		start, err := event.GetStartAt()
		if err != nil {
			continue
		}

		end, err := event.GetEndAt()
		if err != nil {
			continue
		}

		summaryProp := event.GetProperty("SUMMARY")
		locationProp := event.GetProperty("LOCATION")

		if summaryProp == nil || locationProp == nil {
			continue
		}

		events = append(events, F1Event{
			Summary:  summaryProp.Value,
			Location: locationProp.Value,
			Start:    start,
			End:      end,
		})

		// sort events on start
		sort.Slice(events, func(i, j int) bool {
			return events[i].Start.Before(events[j].Start)
		})
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}
